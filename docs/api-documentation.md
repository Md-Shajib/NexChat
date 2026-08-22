# Chat API — Documentation

> Part 1 deliverable. This document was written by exercising the live API, not
> by transcribing the provided Swagger page. The upstream spec is deliberately
> request-only — it documents no response bodies and no status codes — so every
> response shape, status code and error below was **observed** against the
> running deployment and is annotated as such.
>
> Probed: 21 Aug 2026, against `https://frontend-task-chatapp.onrender.com`.

**Contents**

1. [Conventions](#1-conventions)
2. [Authentication](#2-authentication)
3. [Response envelopes](#3-response-envelopes)
4. [Error model](#4-error-model)
5. [Entities](#5-entities)
6. [Endpoints](#6-endpoints)
7. [WebSocket](#7-websocket)
8. [Findings — bugs & inconsistencies](#8-findings--bugs--inconsistencies)
9. [How I'd redesign it](#9-how-id-redesign-it)

---

## 1. Conventions

| | |
|---|---|
| REST base URL | `https://frontend-task-chatapp.onrender.com/api` |
| Socket origin | `https://frontend-task-chatapp.onrender.com` (host **root**, not `/api`) |
| Content type | `application/json; charset=utf-8` |
| Auth | `Authorization: Bearer <jwt>` |
| Id format | Mongo ObjectId, 24-char hex, exposed as **`_id`** |
| Timestamps | ISO-8601 UTC, e.g. `2026-08-21T19:01:20.681Z` |

Two operational notes:

- The API is on a free Render dyno. A cold start takes **20–50 s**; the first
  request after idle will appear to hang. Client timeouts must accommodate this.
- It is a **shared, public, unseeded** database. Anyone with the assignment can
  read and write it. Well-known demo numbers (`+15551234567`, `+15550001111`)
  are actively used by other candidates, so an account's `name` can change under
  you. Use unique phone numbers when testing.

---

## 2. Authentication

There is one credential-ish step and no password.

```
POST /auth/login  { phone, name }  →  { token, user }
```

- A **new** `phone` creates an account. An **existing** `phone` logs in.
- The submitted `name` is written to the account **every time**, so logging in
  with the same number and a new name renames you. *(Verified: re-login with a
  different name, then `GET /auth/me`, returns the new name.)*
- The JWT payload is `{ sub: <userId>, iat, exp }`, HS256, valid **7 days**
  (604 800 s). There is no refresh endpoint — when it expires the user logs in
  again.

Send it on every other endpoint:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

`GET /auth/me` doubles as a token-validity probe and is the source of truth for
the current user.

---

## 3. Response envelopes

The API uses **four different envelopes**, with no rule connecting them to the
endpoint. This is the single most annoying thing about consuming it, so it is
worth stating up front:

| Shape | Endpoint | Example |
|---|---|---|
| Bare object | `POST /auth/login`, `GET /auth/me`, `POST /conversations`, `POST /messages`, all group mutations | `{ "_id": "…", … }` |
| Bare array | `GET /users/search` | `[ { … }, { … } ]` |
| `{ data: [] }` | `GET /conversations` | `{ "data": [ … ] }` |
| `{ messages: [], hasMore }` | `GET /conversations/:id/messages` | `{ "messages": [ … ], "hasMore": true }` |

**Client strategy.** Unwrap and normalise at the API boundary (one Zod schema
per endpoint, `_id` → `id`), so nothing above that layer knows which envelope a
payload arrived in.

---

## 4. Error model

Errors are consistent, which is more than can be said for the successes:

```jsonc
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [                       // present on VALIDATION_ERROR only
      { "path": "name", "message": "name is required" }
    ]
  }
}
```

### Observed codes

| Code | Status | Meaning |
|---|---|---|
| `NO_TOKEN` | **400** ⚠️ | `Authorization` header absent |
| `INVALID_TOKEN` | 401 | Token malformed, expired, or signature invalid |
| `VALIDATION_ERROR` | 400 | Body failed schema validation; carries `details[]` |
| `UNKNOWN_USER` | 400 | A referenced user id does not exist |
| `NOT_A_MEMBER` | 400 | Target user is not in the group |
| `NOT_A_GROUP` | 400 | Group operation attempted on a direct conversation |
| `FORBIDDEN` | 403 | Not a participant, or not an admin |
| `NOT_FOUND` | 404 | Unknown route |
| `SERVER_ERROR` | 500 | Unhandled exception — **leaks raw Mongoose text** |
| `51091` *(number)* | 500 | Raw MongoDB error code — regex compile failure |

⚠️ **Two traps for the client:**

1. A missing token is **400**, not 401 — a status-only check for "session dead"
   will miss it. Branch on `code` as well as `status`.
2. `code` is *usually* a string but is sometimes a **number** (`51091`). Type it
   as `string | number` or normalise on read.

---

## 5. Entities

### User

```jsonc
{
  "_id": "6a88a0b5e5d6aac975244b40",
  "name": "Ada Lovelace",
  "phone": "+8801700000000",
  "createdAt": "2026-08-21T19:02:13.995Z"   // omitted by /users/search
}
```

`phone` is stored **verbatim** — no normalisation. `0170…`, `880170…` and
`+880170…` are three separate accounts.

### Message

```jsonc
{
  "_id": "6a88a080e5d6aac975244967",
  "conversation": "6a88a077e5d6aac97524490d",  // raw id, never populated
  "sender": "6a88a06fe5d6aac9752448ce",        // raw id, never populated
  "text": "msg-5",
  "createdAt": "2026-08-21T19:01:20.681Z"
}
```

There is no `updatedAt`, no edit/delete, no read receipts, no attachments.
Rendering a sender's name requires joining `sender` against the conversation's
participants client-side.

### Conversation — direct (from `GET /conversations`)

```jsonc
{
  "_id": "6a88a077e5d6aac97524490d",
  "type": "direct",
  "participant": {                      // SINGULAR, hydrated, the OTHER user
    "_id": "…", "name": "Doc Bravo", "phone": "+1777…"
  },
  "lastMessage": { "text": "…", "sender": "…", "createdAt": "…" },
  "updatedAt": "2026-08-21T19:01:29.904Z"
}
```

### Conversation — group (from `GET /conversations`)

```jsonc
{
  "_id": "6a88a08ce5d6aac9752449d5",
  "type": "group",
  "name": "Doc Group Renamed",
  "createdBy": "6a88a06f…",
  "admins": ["6a88a06f…", "6a88a070…"],  // raw ids
  "participants": [                       // PLURAL, hydrated, INCLUDES you
    { "_id": "…", "name": "…", "phone": "…" }
  ],
  "lastMessage": {},                      // {} — not null — when no messages
  "updatedAt": "2026-08-21T19:01:44.909Z"
}
```

Note the asymmetry: direct uses `participant` (singular, excludes you), group
uses `participants` (plural, includes you). And `lastMessage` is `{}` rather
than `null` when empty.

---

## 6. Endpoints

### 6.1 `POST /auth/login` — log in or register

*Public.* No auth required.

**Request**

```json
{ "phone": "+8801700000000", "name": "Ada Lovelace" }
```

Both fields are required and must be non-empty strings.

**`200 OK`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "6a88a0b5e5d6aac975244b40",
    "name": "Ada Lovelace",
    "phone": "+8801700000000",
    "createdAt": "2026-08-21T19:02:13.995Z"
  }
}
```

**Errors**

| Status | Body |
|---|---|
| 400 | `VALIDATION_ERROR`, `details: [{ path: "phone", message: "phone is required" }]` |
| 400 | `VALIDATION_ERROR`, `details: [{ path: "name", message: "name is required" }]` |

> `200` for a **created** resource — a new registration should arguably be `201`.
> There is no way to tell from the response whether you just registered or just
> logged in.

---

### 6.2 `GET /auth/me` — current user

**`200 OK`** — a bare `User`, not wrapped:

```json
{ "_id": "…", "name": "Ada Lovelace", "phone": "+880…", "createdAt": "…" }
```

**Errors:** `400 NO_TOKEN`, `401 INVALID_TOKEN`.

---

### 6.3 `GET /users/search` — find people

**Query**

| Name | In | Required? | Notes |
|---|---|---|---|
| `q` | query | Documented as required — **is not enforced** | Name or phone substring |

**`200 OK`** — a **bare array** of users without `createdAt`:

```json
[{ "_id": "…", "name": "ashik", "phone": "01793452836" }]
```

Matching is **not** a substring search, and the two fields behave differently:

| Field | Semantics | Evidence |
|---|---|---|
| `name` | **Prefix**, regex-anchored | user `Zzq Diagnostic`: `q=Zzq` → hit, `q=zq` → 0 |
| `phone` | **Exact, whole-string equality** | phone `5590204983`: `q=5590204983` → hit, `q=559020` → 0, `q=90204983` → 0 |

There is no pagination and no cap — a short `q` returns a very large list. The
caller is included in the results.

> 🔴 **`q` is interpolated into a MongoDB `$regex` without escaping.** This is
> the most serious bug in the API and it breaks the assignment's own use case.
>
> | `q` | Result |
> |---|---|
> | `+8801700000000` | **500** `Regular expression is invalid: quantifier does not follow a repeatable item` |
> | `*`, `?`, `+` | **500** — same |
> | `(`, `[` | **500** `missing closing parenthesis` / `missing terminating ]` |
> | `a)` | **500** `unmatched closing parenthesis` |
> | `.*` | **200** — returns **every user in the database** |
> | *(omitted or empty)* | **200** — returns every user |
>
> Searching by phone number in E.164 — i.e. typing the `+` the login screen
> asks for — crashes the endpoint. `.*` is a working regex-injection read of
> the entire user table.
>
> **Client workaround:** escape regex metacharacters before sending, and treat
> an empty `q` as "don't query". See §8.1.

> 🔴 **A phone number stored with a leading `+` cannot be found at all.**
> The two bugs above compound into a dead end:
>
> | Query for the existing account `+8801712345678` | Result |
> |---|---|
> | `+8801712345678` (raw) | **500** — the `+` fails to compile as a regex |
> | `\+8801712345678` (escaped) | **200, 0 hits** — phone is matched by *equality*, and the escaped string is no longer equal |
> | `8801712345678` / `880171` (no `+`) | **0 hits** — not equal to the stored value |
>
> Escaping is still the right client behaviour — a graceful empty state beats a
> 500 — but it converts a crash into a miss rather than into a result. Accounts
> whose phone was stored *without* a `+` are found normally by exact match, so
> the failure is specific to E.164-formatted records. There is no client-side
> fix; the endpoint needs to escape its own input and match phones by
> normalised substring.

---

### 6.4 `GET /conversations` — my conversations

**`200 OK`**

```json
{ "data": [ /* direct and group conversations, mixed */ ] }
```

Ordering is **not guaranteed** — sort client-side by
`lastMessage.createdAt ?? updatedAt`.

There is no `GET /conversations/:id`, so this list is the only source of
conversation metadata; a single conversation must be derived from it.

---

### 6.5 `POST /conversations` — start a direct conversation

**Request** — `{ "userId": "<other user's _id>" }`

**`200 OK`** — ⚠️ a **thin stub**, *not* the same shape as a list item:

```json
{
  "_id": "6a88a0bde5d6aac975244ba0",
  "participants": ["<meId>", "<otherId>"],   // raw ids, not hydrated
  "createdAt": "2026-08-21T19:02:21.651Z"
}
```

No `type`, no `lastMessage`, no hydrated users. Idempotent — calling it twice
for the same pair returns the same `_id` rather than creating a duplicate.

**Errors**

| Status | Code | Trigger |
|---|---|---|
| 400 | `UNKNOWN_USER` | Valid ObjectId, no such user |
| 500 | `SERVER_ERROR` | **Malformed** id (e.g. `"nope"`) — raw Mongoose cast error |

> ⚠️ Passing **your own** `userId` returns `200` with an *unrelated existing
> conversation* rather than rejecting. See §8.4.

**Client strategy:** take only `_id` from this response, then invalidate and
refetch `GET /conversations` to get a well-formed conversation.

---

### 6.6 `POST /conversations/group` — create a group

**Request**

```json
{ "name": "Project Team", "participantIds": ["<id>", "<id>"] }
```

`participantIds` excludes you. A group needs **≥ 3 members total**, so you must
supply at least 2 ids.

**`201 Created`** — and, unlike `POST /conversations`, this returns a **fully
hydrated group**:

```jsonc
{
  "_id": "…", "type": "group", "name": "RBAC Test",
  "createdBy": "…", "admins": ["<creator>"],
  "participants": [ { "_id": "…", "name": "…", "phone": "…" } ],
  "createdAt": "…", "updatedAt": "…"
}
```

The creator becomes the sole admin.

**Errors**

| Status | Detail |
|---|---|
| 400 | `participantIds` → `"a group needs at least 3 members"` |
| 400 | `name` → `"name is required"` |

> Two sibling creation endpoints, two different status codes (`200` vs `201`)
> and two different response shapes (stub vs hydrated).

---

### 6.7 `GET /conversations/:id/messages` — history

**Params**

| Name | In | Notes |
|---|---|---|
| `id` | path | Conversation id |
| `limit` | query | Page size. **Not validated** — see below |
| `before` | query | Message-id cursor. **Inclusive** — see below |

**`200 OK`**

```json
{ "messages": [ /* NEWEST first */ ], "hasMore": true }
```

Three behaviours that materially affect the client:

1. **Order is newest-first (descending).** Reverse for rendering.
2. 🔴 **`before` is inclusive.** Requesting `?before=<id>` returns the message
   with that id *again* as the first element of the next page.

   ```
   ?limit=2            → [msg-5, msg-4]   hasMore: true
   ?limit=2&before=msg-4 → [msg-4, msg-3]  ← msg-4 repeated
   ```

   Paginating naively duplicates one message at every page boundary. **The
   client must de-duplicate by id when merging pages.**
3. **`limit` is unvalidated.** `0`, `-1` and `9999` are all ignored and return
   the *entire* history with `hasMore: false`. There is no server-side ceiling,
   so a large conversation is one request away from an enormous payload.

**Errors**

| Status | Code | Trigger |
|---|---|---|
| 403 | `FORBIDDEN` | `"Not a participant of this conversation"` |
| 500 | `SERVER_ERROR` | Malformed `id` **or** malformed `before` — raw cast error |

---

### 6.8 `POST /messages` — send

**Request** — `{ "conversationId": "…", "text": "Hello!" }`

Works for direct and group conversations alike.

**`200 OK`** — the persisted `Message`, bare.

**Errors**

| Status | Detail |
|---|---|
| 400 | `VALIDATION_ERROR` — `text` missing, or not a string (`"Expected string, received number"`) |
| 403 | `FORBIDDEN` — `"Not a participant of this conversation"` |

> 🔴 **`""` and `"   "` are accepted and persisted, returning `200`.** The
> assignment requires that empty messages not be sendable; the API will not
> enforce it, so the client is the only guard. (Whitespace-only messages from
> other candidates are already visible in the shared database.)

The message is **also** broadcast over `message:new` — including back to the
sender — so a client that both reads the REST response *and* listens to the
socket will render it twice unless it de-duplicates by `_id`.

---

### 6.9 Group management

All four require membership; all four return the **full updated group object**
(same shape as §6.6) with `200 OK` — not an empty body.

| Endpoint | Method | Body | Who |
|---|---|---|---|
| `/conversations/:id/participants` | POST | `{ userIds: [] }` | Admins only |
| `/conversations/:id/participants/:userId` | DELETE | — | Admins (own id = leave) |
| `/conversations/:id/admins` | POST | `{ userId }` | Admins only |
| `/conversations/:id` | PATCH | `{ name }` | Admins only |

**Observed permission errors**

| Action | Status | Message |
|---|---|---|
| Non-admin adds a member | 403 | `"Only admins can add participants"` |
| Non-admin renames | 403 | `"Only admins can rename the group"` |
| Non-admin removes **someone else** | 403 | `"Only admins can remove other members"` |
| Non-member removes anyone | 403 | `"Only members can remove participants"` |
| Promote a non-member | 400 | `NOT_A_MEMBER` — `"Target user is not a member of this group"` |
| PATCH a **direct** conversation | 400 | `NOT_A_GROUP` — `"Not a group conversation"` |

Any member may remove **themselves** (that is "leave"). Adding a user who is
already a member is a silent idempotent `200` — no duplicate, no error.

There is no demote-admin endpoint, no delete-group endpoint, and no way to
transfer ownership. A group whose only admin leaves is left unadministered.

---

### 6.10 `GET /health`

> The Swagger page lists this under the `/api` base, but **`/api/health` returns
> `404 NOT_FOUND`**. It actually lives at the host root.

```
GET https://frontend-task-chatapp.onrender.com/health   →  200  { "status": "ok" }
```

Useful for warming the dyno before the user hits login.

---

## 7. WebSocket

Socket.io, at the **host root** — *not* under `/api`. Pointing the client at
the REST base is the easiest way to get a silent connection failure.

```ts
import { io } from "socket.io-client";

const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },          // same JWT; missing/invalid is rejected at handshake
  transports: ["websocket", "polling"],
});
```

| Direction | Event | Payload |
|---|---|---|
| client → server | `message:send` | `{ conversationId, text }`, optional ack callback |
| server → client | `message:new` | A `Message`, in the same wire shape as REST |
| server → client | `conversation:updated` | A group you belong to was created, renamed, or re-membered |

Notes:

- `message:new` is delivered to **all** participants **including the sender**.
- `conversation:updated` carries an undocumented partial payload; treat it as a
  *signal* and refetch `GET /conversations` rather than trusting its contents.
- There is no `typing`, no presence/online event, and no delivery/read receipt.
- Sending via REST and sending via `message:send` are equivalent; using REST
  gives you a definitive success/failure to hang optimistic UI off, so this
  implementation sends over REST and treats the socket as receive-only.

---

## 8. Findings — bugs & inconsistencies

Ordered by how much they affect a client. Every item was reproduced against the
live API.

### 🔴 Severity: high

**8.1 — Unescaped regex injection in `/users/search`**
`q` is interpolated straight into a MongoDB `$regex`. `+`, `*`, `?`, `(`, `[`
return **500**; `.*` dumps the entire user table. Searching by E.164 phone —
the assignment's stated flow — crashes the endpoint.
*Handled by:* escaping regex metacharacters in the client's API layer before
the request, and refusing to send an empty `q`. The real fix is server-side:
`escapeRegExp(q)`, or a text index.

**8.2 — `before` cursor is inclusive**
`?before=<id>` re-returns `<id>`, duplicating one message per page boundary.
*Handled by:* de-duplicating by message id when merging pages into the cache.
The centralised merge in `features/chat/services/message-cache.service.ts`
already keys on id, so the duplicate collapses rather than rendering twice.

**8.3 — Empty and whitespace-only messages are accepted (`200`)**
*Handled by:* a Zod schema that `.trim()`s before `.min(1)`, enforced in the
composer and again in the send mutation before the optimistic insert.

**8.4 — Starting a conversation with yourself returns someone else's**
`POST /conversations { userId: <your own id> }` returns `200` with an unrelated
existing conversation, presumably because the participant lookup de-duplicates
`[me, me]` to `[me]` and matches the first conversation containing you.
*Handled by:* filtering the current user out of search results, so the UI never
offers self as a target.

### 🟠 Severity: medium

**8.5 — Missing token returns `400`, not `401`**
`NO_TOKEN` is a `400`. A client that keys "log out" off `status === 401` will
silently ignore it.
*Handled by:* an `isUnauthorized` predicate matching on `status === 401 ||
code === NO_TOKEN || code === INVALID_TOKEN`.

**8.6 — Malformed ObjectIds produce `500` with a raw Mongoose message**
e.g. `Cast to ObjectId failed for value "nope" … for model "User"`. Should be a
`400`/`404`. It also leaks the ORM, the model names and the schema paths.
*Handled by:* never surfacing a 5xx `message` to the user — the error component
substitutes a generic line for any `status >= 500`.

**8.7 — `limit` is unvalidated and uncapped**
`0`, `-1` and `9999` all return the full history. No server-side maximum.
*Handled by:* always sending an explicit, sane `limit`.

**8.8 — Four different response envelopes**
Bare object / bare array / `{ data }` / `{ messages, hasMore }`, with no rule.
*Handled by:* one Zod schema per endpoint, unwrapping at the API boundary.

**8.9 — Create-conversation and create-group disagree with each other**
`POST /conversations` → `200` + thin stub with raw ids.
`POST /conversations/group` → `201` + fully hydrated object.
Same conceptual operation, different status code and different shape.
*Handled by:* treating both as "returns an id", then refetching the list.

**8.10 — `error.code` is not always a string**
The MongoDB regex failure surfaces `"code": 51091` — a number.
*Handled by:* typing the field as `string | number` and coercing on read.

### 🟡 Severity: low / design smells

**8.11** — `lastMessage` is `{}` rather than `null` when a conversation has no
messages. A truthiness check on it is a bug waiting to happen.

**8.12** — Direct conversations expose `participant` (singular, excludes you);
groups expose `participants` (plural, includes you). Two conventions for one
concept.

**8.13** — `GET /conversations` returns no ordering guarantee, so the sidebar
must sort client-side.

**8.14** — No `GET /conversations/:id`. A deep link to a conversation has to
fetch the entire list to resolve one row.

**8.15** — `q` is documented as required but is not enforced; omitting it
returns every user.

**8.16** — Registration returns `200`, and is indistinguishable from a login.

**8.17** — `/health` is documented under `/api` but is served from the root.

**8.18** — `messages` are never populated — `sender` is a raw id — so the client
must join against participants to show a name. In a group you left, or for a
member who has since been removed, that join fails and the sender is unresolvable.

**8.19** — No demote-admin, no delete-group, no ownership transfer. If the only
admin leaves, the group can never be administered again.

**8.20** — JWTs last 7 days with no refresh endpoint and no revocation.

**8.21** — Phone numbers are stored verbatim with no normalisation, so
`0170…` / `880170…` / `+880170…` become three distinct accounts for one person.
*Handled by:* normalising to E.164 client-side before login.

---

## 9. How I'd redesign it

The brief invites renaming or restructuring endpoints. Keeping the same
capabilities, this is the shape I'd ship:

### Consistent envelope

Every collection paginates the same way; every single resource is returned bare.

```jsonc
// collections
{ "data": [ … ], "page": { "nextCursor": "…", "hasMore": true } }
```

### Consistent identifiers

`id`, not `_id`. Never leak the storage engine's field naming through the API.

### Routes

| Now | Proposed | Why |
|---|---|---|
| `POST /auth/login` | `POST /sessions` | It creates a session. `201` on register, `200` on login, so the client can tell. |
| `GET /auth/me` | `GET /me` | Shorter, and it isn't really an auth concern. |
| `GET /users/search?q=` | `GET /users?query=` | Filtering a collection is not a sub-resource. Paginated, `query` escaped, min length enforced. |
| `POST /conversations` | `POST /conversations` with `{ type: "direct", participantIds: [id] }` | One creation endpoint for both kinds… |
| `POST /conversations/group` | *(merged above,* `type: "group"` *)* | …instead of two that disagree on status code and shape. |
| — | `GET /conversations/:id` | Resolve a deep link without fetching everything. |
| `GET /conversations/:id/messages` | unchanged, but `before` **exclusive** and `limit` clamped to `1..100` | Removes the duplicate-per-page bug. |
| `POST /messages` | `POST /conversations/:id/messages` | The message belongs to the conversation; the id belongs in the path. |
| `PATCH /conversations/:id` | unchanged | Fine as-is. |
| `POST /conversations/:id/admins` | `PUT /conversations/:id/members/:userId/role` | Symmetrical, and it makes *demotion* expressible. |
| `DELETE /conversations/:id/participants/:userId` | `DELETE /conversations/:id/members/:userId` | `members` everywhere; drop `participants`/`participant`. |
| `GET /health` *(at root)* | `GET /health` *(documented at root)* | Just document where it actually is. |

### Unified conversation shape

One shape for both types — `members` always plural, always hydrated, always
including the caller, with `lastMessage: Message | null`:

```jsonc
{
  "id": "…",
  "type": "direct" | "group",
  "name": null | "Project Team",     // null for direct; client derives a title
  "members": [ { "id": "…", "name": "…", "phone": "…", "role": "admin" | "member" } ],
  "lastMessage": null | { … },
  "updatedAt": "…"
}
```

Folding `admins: string[]` into a `role` on each member removes a second lookup
and makes "is this person an admin" a local property rather than an array scan.

### Validation and status codes

- Validate and **escape** every user-supplied string that reaches a query.
- Reject empty/whitespace `text` with `400`.
- Malformed id → `400`; valid-but-absent id → `404`. Never `500`.
- Missing token → `401`, consistently with an invalid one.
- Never return an ORM error message to a client.

### Real-time

Add `typing` and `presence` events, and a `message:ack` carrying the client's
correlation id so optimistic UI can reconcile without guessing.

---

*Written from live observation of the deployed API on 21 Aug 2026. Where the
provided Swagger and the running service disagree, the service is documented and
the discrepancy noted.*
