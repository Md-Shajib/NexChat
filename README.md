# Next Chat

A real-time one-to-one and group chat client built against the provided Chat API,
plus a landing page introducing it.

Submission for the Frontend Developer take-home assignment.

---

## Live demos

| | URL |
|---|---|
| **Part 1 — Chat application** | `<add your Vercel URL>/login` |
| **Part 2 — Landing page** | `<add your Vercel URL>/` |

Both parts ship from a single deployment: `/` is the landing page, `/login` and
`/chat` are the product.

> **Sign in with a phone number in international format** (e.g. `+8801700000000`)
> and any name. There is no separate signup — an unrecognised number creates an
> account. The API's database is shared and public, so you will see other
> people's test accounts in search results.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript, `strict` |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| HTTP | Axios |
| Real-time | Socket.IO client |
| Forms | React Hook Form + Zod |
| Dates | date-fns |
| Package manager | pnpm |

No component library. The UI primitives in `src/shared/ui` are hand-rolled — see
[Design decisions](#design-decisions-part-2).

---

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Other scripts:

```bash
pnpm build          # production build
pnpm start          # serve the production build
pnpm lint           # eslint, zero warnings tolerated
pnpm typecheck      # tsc --noEmit
```

Requires Node ≥ 20.9.

### Environment variables

Copy `.env.example` to `.env.local` if you want to override the defaults:

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://frontend-task-chatapp.onrender.com/api` | REST base |
| `NEXT_PUBLIC_SOCKET_URL` | `https://frontend-task-chatapp.onrender.com` | Socket origin — the **host root**, not `/api` |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | The API is on a free dyno that cold-starts |

Every variable has a working default, so the app builds and runs with no
configuration. `src/config/env.ts` is the only module that reads `process.env`,
and it validates with Zod at import time so a bad value fails loudly rather than
surfacing later as a confusing network error.

---

## API documentation

The Part 1 documentation deliverable lives in
**[`docs/api-documentation.md`](docs/api-documentation.md)**.

It was written by exercising the live API rather than transcribing the provided
Swagger page — the upstream spec is request-only and documents no response
bodies or status codes, so every shape, status and error in that document was
observed against the running deployment. It also contains a graded list of the
bugs and inconsistencies I found, and a proposed redesign of the routes.

---

## Architecture

Feature-sliced, with a domain layer underneath.

```
src/
├── app/           # routing and composition only — no business logic
├── features/      # auth, chat, conversation, group-chat, profile, marketing
├── domains/       # user, message, conversation, group — entities and schemas
├── shared/        # ui, components, hooks, lib, utils, icons — feature-agnostic
├── lib/           # axios, query-client, websocket
├── providers/     # app-wide client boundaries
├── config/        # env, app config
├── constants/     # routes, query keys, socket events, endpoints
├── types/         # transport-level and utility types
└── styles/        # design tokens + global CSS
```

**Rules that are actually enforced in the code:**

- Features talk to each other only through their `index.ts` barrels, never by
  reaching into internals. The dependency graph is one-directional
  (`group-chat → conversation`); where two features needed to be mounted
  together, the composition lives at the route
  (`app/(dashboard)/chat/chat-modals.tsx`) rather than making the barrels
  circular.
- No component calls Axios. Requests live in `features/*/api`, one file per
  endpoint.
- `shared/` never imports from `features/`.
- The domain layer holds no UI.

### Data flow

```
component → hook (React Query) → api fn → http() → axios
                                            │
                                            └── Zod parse + normalise (_id → id)
                                                        │
                                                    ApiError
```

Two details worth calling out:

**Everything is validated at the boundary.** The API documents no response
shapes at all, so each endpoint has a Zod schema and `lib/axios/request.ts`
parses through it. A drift in the API becomes a located, named error instead of
an `undefined` three components deep. The same schemas parse the **socket**
payloads, so the REST and real-time paths cannot diverge.

**One error type crosses the boundary.** Axios errors are normalised into
`ApiError` by an interceptor, so nothing above the API layer knows Axios exists.
`ApiError` exposes `isUnauthorized`, `isValidation`, `isRetryable` and
`fieldErrors`, which is what lets React Query's retry policy and the shared
`ErrorState` component behave sensibly without inspecting HTTP internals.

### Real-time

A single socket is opened for the whole `/chat` segment. Incoming
`message:new` events are parsed and merged into the React Query cache; nothing
below the shell knows a socket exists — components just re-render from cache.

Sends go over **REST**, not the socket, because the REST call gives a definitive
success/failure to hang optimistic UI on. The server echoes every message back
over `message:new` *including to the sender*, so all three write paths
(optimistic insert, REST response, socket echo) funnel through one merge
function in `features/chat/services/message-cache.service.ts` that keys on
message id and a client-generated correlation id. Without that, the sender sees
every message twice.

---

# Part 3 — Thought process

## Architecture and library decisions

**Feature-sliced over layer-first.** A `components/ hooks/ services/` split
scales with file *type*, not with the product. Grouping by feature means the
chat panel's API calls, hooks, schemas and components sit together, and the
blast radius of a change is a directory. The trade-off is more ceremony up
front — barrels, more folders, occasional "where does this go" decisions — which
only pays off if the project grows. For a 24-hour task it is arguably over-built;
I went with it because the brief explicitly asks to treat this as production
code, and because it made the feature boundaries obvious enough to keep the
codebase navigable while moving fast.

**TanStack Query for server state, Zustand only for UI state.** Messages,
conversations and the current user are server-owned and benefit from caching,
deduplication, background refetch and an infinite-query cursor. Zustand holds
only things the server has no opinion about: which modal is open, the sidebar
filter, the session token.

The token is the one deliberate exception to "Zustand is UI-only". It is
client-owned, needs to be read *synchronously* by the Axios interceptor before
any React tree exists, and modelling it as server state would mean every request
waiting on a query to settle. The cached user object in the store is a
first-paint optimisation only — `GET /auth/me` remains the source of truth, and
the store is corrected from it on every load.

**Zod everywhere, not just on forms.** Given an API with no documented response
shapes, schemas at the boundary were the cheapest way to make an undocumented
contract explicit and self-checking.

**No component library.** shadcn/ui was in my original plan and I dropped it.
The brief asks for a distinctive visual result, and shadcn's defaults are
recognisable on sight; I would have spent the time overriding it. The primitives
actually needed here are few — button, input, avatar, modal, skeleton, spinner —
and hand-rolling them meant the dialog could be built on the native `<dialog>`
element, which gets focus trapping, focus restore, Escape handling, background
inertness and top-layer stacking correct by construction rather than by
re-implementation.

**Client-side auth guard rather than middleware.** The JWT lives in
`localStorage`, which middleware cannot read. The guard therefore runs in the
browser and, crucially, waits for the store to hydrate before deciding —
redirecting on an unhydrated store would bounce every authenticated user to
`/login` on a hard refresh. The trade-off is a brief loading state on first
paint. A cookie-based session would allow a server-side redirect, but the API
issues a bearer token and I did not want to invent a session layer around it.

### The chat panel

The brief says this is where it will be looked at closest, so:

- **Scroll anchoring** (`shared/hooks/use-stick-to-bottom.ts`) tracks whether
  the user is pinned to the bottom. New messages auto-scroll only while pinned;
  otherwise they increment a counter behind a "N new messages" pill. Sending
  your own message always scrolls, because that is an explicit intent to be at
  the bottom. Loading older messages captures and restores scroll offset, so
  prepending history doesn't shove the text you're reading up the screen.
- **Optimistic sends** render instantly as `sending`, get patched to `sent` when
  the server responds, and are marked `failed` — retryable, with the text
  preserved — if it doesn't.
- **Empty messages** are blocked in the composer's Zod schema (`.trim()` before
  `.min(1)`) *and* again in the send mutation. The API accepts `""` and returns
  200, so the client is the only guard.
- **Enter sends, Shift+Enter newlines**, and the handler ignores `isComposing`
  so IME input isn't committed half-typed.

## Design decisions (Part 2)

The visual direction is deliberately quiet: a near-neutral surface palette with
a single desaturated green accent, generous type, and almost no chrome. Chat
clients are read for hours, and a landing page that promises a calm reading
surface should look like one. Colour is used to carry meaning — the accent marks
actions and outgoing messages, and nothing else competes for it.

Everything is driven by CSS custom properties in `src/styles/globals.css` and
exposed to Tailwind via `@theme inline`. Light and dark are one token swap, and
because the landing page and the product share the token set, the in-page demo
looks like the real thing because it *is* the real thing.

**The bonus attempt.** The brief warns that a generic addition won't count, so
rather than a feature card claiming good scroll behaviour, the hero mockup is a
working chat panel running `useStickToBottom` — the same hook the real message
list uses. Messages stream in; scroll up mid-stream and your position holds
while a counter collects what arrived; tap it to return. The composer refuses
whitespace exactly as the real one does. The page's central claim is falsifiable
in the same viewport that makes it, and because the demo shares the production
hook, a regression there breaks the demo too.

Illustrations are custom SVG drawn for the sections they sit in — a fan-out for
real-time delivery, a held viewport with messages queueing below it for scroll
anchoring, intersecting member circles for groups. They use `currentColor` so
they re-theme with the page, and the animated pulses sit behind
`motion-reduce:hidden`.

## How I used AI

> Adjust this section to match your own account of the work before submitting.

This project was built with **Claude Code** (Claude Opus). What it was used for:

- **Probing the API.** The most valuable use by far. I had it write throwaway
  Node scripts that exercised every endpoint against the live deployment —
  happy paths, permission boundaries, malformed input, pagination edges — and
  the entire API documentation was written from those observations rather than
  from the Swagger page. Several findings below would not have surfaced any
  other way.
- **Drafting** the API documentation, this README, and the domain schemas.
- **Scaffolding** the architecture and the repetitive parts: one file per
  endpoint, barrels, Zod schemas, the icon set.

What was corrected or rejected:

- **A wrong finding in the first draft of the API docs.** An early probe
  suggested `POST /auth/login` echoed a submitted name without persisting it. It
  turned out the shared public database had another candidate logging into the
  same demo phone number between my two calls. Re-probing with unique numbers
  disproved it, and both the document and the code comment that had been written
  around it were corrected. Worth stating plainly: the first confident
  explanation was wrong, and only re-testing caught it.
- **Two ESLint `react-hooks/set-state-in-effect` errors.** The tempting fix is
  a disable comment. Instead the socket status moved to `useSyncExternalStore`
  over the socket client — the socket is an external system that already holds
  the truth, so React should subscribe to it rather than mirror it — and the
  composer's per-conversation draft reset became a `key` prop, which is React's
  own idiom for it. Both are better than what was there before the linter
  complained.
- **A circular dependency between two feature barrels**, introduced when the
  modal composition was first placed inside the `conversation` feature. Moved to
  the route.
- **shadcn/ui**, dropped as described above.

## What I'd do with more time

Honestly ordered by what I think matters most:

1. **Tests.** There are none, and the two places that most need them are the
   scroll-anchoring hook and the message-cache merge — both are stateful,
   full of edge cases, and exactly the kind of logic that regresses silently.
   Playwright for the login → send → receive path, unit tests for the merge.
2. **Group management UI.** The API layer and hooks for rename, add member,
   remove member, promote admin and leave are all written and typed, but only
   group *creation* has an interface. This is the largest gap between what the
   codebase supports and what a user can actually do.
3. **Message list virtualisation.** Every loaded message is in the DOM. Fine for
   a demo conversation, not for a long thread.
4. **An offline send queue.** Failed sends are retryable by hand; they should
   drain automatically on reconnect.
5. **Unread counts and typing indicators** — both need API support that doesn't
   currently exist (see the redesign section of the API docs).
6. **A screen-reader pass.** Semantics, labels and focus states are in place and
   the dialog is built on the native element, but I have not driven the app with
   a screen reader, and I would not claim it is verified until I had.

---

## Issues I ran into with the API

Full detail, with reproductions and severity, is in
[`docs/api-documentation.md` §8](docs/api-documentation.md#8-findings--bugs--inconsistencies).
The ones that changed how the client is built:

**1. `/users/search?q=` is a regex injection.** The query string is interpolated
into a MongoDB `$regex` unescaped. Searching for a phone number in international
format — i.e. typing the `+` that the login screen asks for — returns **500**
(`quantifier does not follow a repeatable item`). `(` and `[` fail the same way,
and `q=.*` returns **every user in the database**. This breaks the assignment's
own stated flow ("the user searches by a number or name").
*Worked around* by escaping regex metacharacters in the API layer before the
request, and refusing an empty `q`. The real fix is server-side.

**2. The `before` pagination cursor is inclusive.** Requesting
`?before=<id>` returns that message *again* as the first item of the next page,
so naive pagination duplicates one message at every page boundary.
*Worked around* by de-duplicating on id when merging pages.

**3. Empty and whitespace-only messages are accepted with a 200.** The brief
requires they not be sendable; the API will happily persist them, and other
candidates' blank messages are visible in the shared database.
*Worked around* by validating client-side in two places.

**4. Starting a conversation with yourself returns someone else's conversation.**
`POST /conversations { userId: <your own id> }` responds 200 with an unrelated
existing conversation rather than rejecting.
*Worked around* by filtering the current user out of search results.

**5. A missing token is `400 NO_TOKEN`, not `401`.** An invalid token *is* 401.
Any client keying "session expired" off the status alone silently ignores the
first case. *Worked around* by matching on error code as well as status.

**6. Malformed ObjectIds return `500` with raw Mongoose text** — e.g.
`Cast to ObjectId failed for value "nope" ... for model "User"` — leaking the
ORM, model names and schema paths. Should be a 400 or 404.
*Worked around* by never showing a 5xx message to the user.

**7. Four different response envelopes** across the API: bare object, bare
array, `{ data: [] }`, and `{ messages: [], hasMore }`, with no rule connecting
shape to endpoint. The two conversation-creation endpoints disagree with each
other on both status code (200 vs 201) and response shape (thin stub vs fully
hydrated object).
*Worked around* by unwrapping and normalising per-endpoint at the API boundary.

**8. Smaller things:** `limit` is unvalidated and uncapped (`0`, `-1` and `9999`
all return the entire history); `lastMessage` is `{}` rather than `null` when
empty; direct conversations expose `participant` (singular, excluding you) while
groups expose `participants` (plural, including you); `error.code` is usually a
string but is sometimes a number; there is no `GET /conversations/:id`, so a
deep link must fetch the whole list to resolve one row; and `/health` is
documented under `/api` but actually served from the host root.

One non-bug worth flagging for anyone testing this: **the API's database is
shared, public and unseeded.** Any candidate can read and write it. Well-known
demo numbers are actively in use by other people, so an account's name can
change under you mid-session — which is exactly what produced the incorrect
finding described in the AI section above.
