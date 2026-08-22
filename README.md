# Next Chat

A real-time one-to-one and group chat client built on the provided Chat API, and
a landing page to introduce it.

Submission for the Frontend Developer take-home.

---

## Live demos

| | URL |
|---|---|
| **Part 1 — Chat application** | https://shajib-next-chat.netlify.app/login |
| **Part 2 — Landing page** | https://shajib-next-chat.netlify.app/ |

Both ship from one deployment. `/` is the landing page; `/login` and `/chat` are
the product.

To sign in, enter a phone number in international format (`+8801700000000`) and
any name. There's no separate signup — if the number isn't recognised, the API
creates the account.

One warning before you try it: the API's database is shared and public, and every
candidate is writing to the same one. You'll see other people's test accounts in
search results, and if you sign in with an obvious demo number, expect someone
else to have used it too. Pick something unlikely.

---

## What's implemented

| Requirement | Where |
|---|---|
| Login / implicit registration by phone + name | `/login` |
| Start a conversation by searching name or number | Sidebar → new conversation |
| Group conversations with multiple participants | Sidebar → new group |
| Group management — rename, add, remove, promote, leave | Group chat header → Manage |
| Message history, sender/receiver distinguished, timestamped | `/chat/[id]` |
| Sending messages, empty and whitespace-only blocked | Composer |
| Real-time incoming messages, no refresh | Socket.IO, merged into the query cache |
| Loading, empty and error states | Throughout — skeletons, `EmptyState`, `ErrorState` |
| Auto-scroll that doesn't hijack the reader | `use-stick-to-bottom.ts` |
| Landing page | `/` |

Group management goes past what the brief asked for (which was only *creating*
groups). The API supports rename, add, remove, promote and leave, the hooks were
already written, and leaving them unreachable felt worse than finishing them.

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

No component library — the primitives in `src/shared/ui` are hand-rolled. Reasons
are in [Design decisions](#design-decisions-part-2).

---

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

```bash
pnpm build          # production build
pnpm start          # serve the production build
pnpm lint           # eslint, zero warnings tolerated
pnpm typecheck      # tsc --noEmit
```

Needs Node ≥ 20.9.

### Environment variables

Copy `.env.example` to `.env.local` if you want to override anything:

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://frontend-task-chatapp.onrender.com/api` | REST base |
| `NEXT_PUBLIC_SOCKET_URL` | `https://frontend-task-chatapp.onrender.com` | Socket origin — the **host root**, not `/api` |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | The API is on a free dyno that cold-starts |

All three have working defaults, so it builds and runs with nothing configured —
which is also why it deployed to Netlify without any environment setup.
`src/config/env.ts` is the only file that touches `process.env`, and it validates
with Zod at import time so a bad value fails immediately instead of turning up
later as a confusing network error.

---

## API documentation

The Part 1 deliverable is in
**[`docs/api-documentation.md`](docs/api-documentation.md)**.

I wrote it by exercising the live API rather than transcribing the Swagger page.
The provided spec is request-only — it documents no response bodies and no status
codes, and says so explicitly — so every shape, status and error in that document
came from hitting the running deployment and writing down what came back. It also
contains a graded list of the bugs I found and a proposed redesign of the routes,
since the brief said renaming endpoints was fair game.

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

Four rules the code actually holds to:

- Features talk to each other only through their `index.ts` barrels, never by
  reaching into internals. The dependency graph runs one way
  (`group-chat → conversation`). Where two features had to be mounted together,
  the composition sits at the route (`app/(dashboard)/chat/chat-modals.tsx`)
  instead of making the barrels import each other.
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

Two things here mattered more than I expected.

**Everything is validated at the boundary.** Because the API documents no
response shapes, each endpoint has a Zod schema and `lib/axios/request.ts` parses
through it. When the API drifts, you get a named error pointing at the field
instead of an `undefined` surfacing three components away. The same schemas parse
the socket payloads, so the REST and real-time paths can't quietly diverge —
which turned out to matter, because both write into the same cache.

**One error type crosses the boundary.** An interceptor normalises Axios errors
into `ApiError`, so nothing above the API layer knows Axios exists. `ApiError`
exposes `isUnauthorized`, `isValidation`, `isRetryable` and `fieldErrors`, and
that's what lets the retry policy and the shared `ErrorState` behave sensibly
without either of them poking at HTTP internals. It also gave me somewhere
sensible to hide the API's habit of returning 400 where it means 401.

### Real-time

One socket for the whole `/chat` segment. Incoming `message:new` events are
parsed and merged into the React Query cache, and nothing below the shell knows a
socket exists — components just re-render from cache.

Sends go over REST rather than the socket, because the REST call gives a
definite success or failure to hang optimistic UI on. The catch is that the
server echoes every message back over `message:new` *including to the sender*,
so there are three separate paths writing the same message into the cache: the
optimistic insert, the REST response, and the socket echo. They all funnel
through one merge function in
`features/chat/services/message-cache.service.ts`, keyed on message id plus a
client-generated correlation id. Without that, you see everything you send twice.

---

# Part 3 — Thought process

## Architecture and library decisions

**Feature-sliced over layer-first.** A `components/ hooks/ services/` split
scales with file type rather than with the product. Grouping by feature keeps the
chat panel's API calls, hooks, schemas and components together, so the blast
radius of a change is one directory. The cost is ceremony — barrels, more
folders, the occasional "where does this belong" pause — and that only pays off
if the thing grows. For a 24-hour exercise it's arguably over-built. I went with
it because the brief asked for production code, and because clear boundaries are
what let me move fast later without breaking things I'd already finished.

**TanStack Query for server state, Zustand only for UI state.** Messages,
conversations and the current user are server-owned and get real value from
caching, deduplication and the infinite-query cursor. Zustand holds only what the
server has no opinion about: which modal is open, the sidebar filter, the token.

The token is a deliberate exception to "Zustand is UI-only". It's client-owned
and the Axios interceptor needs to read it *synchronously*, before any React tree
exists. Modelling it as server state would mean every request waiting on a query
to settle. The cached user next to it is only a first-paint optimisation —
`/auth/me` stays the source of truth, and the store gets corrected from it.

**Zod everywhere, not just on forms.** With an API that documents no response
shapes, schemas at the boundary were the cheapest way to turn an undocumented
contract into something explicit and self-checking.

**No component library.** shadcn/ui was in my original plan and I dropped it. The
brief asks for a distinctive result, shadcn's defaults are recognisable on sight,
and I'd have spent the time overriding them. The primitives actually needed here
are few — button, input, avatar, modal, skeleton, spinner. Hand-rolling them also
meant the dialog could be built on the native `<dialog>` element, which gets
focus trapping, focus restore, Escape, background inertness and top-layer
stacking right by construction instead of by reimplementation.

**Client-side auth guard rather than middleware.** The JWT lives in
`localStorage`, which middleware can't read, so the guard runs in the browser.
The important part is that it waits for the store to hydrate before deciding —
redirecting on an unhydrated store bounces every logged-in user to `/login` on a
hard refresh, which is the kind of bug that only shows up after you've stopped
looking for it. The cost is a brief loading state on first paint. A cookie
session would allow a server-side redirect, but the API issues a bearer token and
I didn't want to invent a session layer around it.

### The chat panel

The brief says this is where you'll look closest, so it got the most attention.

**Scroll anchoring** lives in `shared/hooks/use-stick-to-bottom.ts`. It tracks
whether the reader is pinned to the bottom; new messages auto-scroll only while
that holds, and otherwise increment a counter behind a "N new messages" pill.
Sending your own message always scrolls, because hitting enter is an explicit
statement that you want to be at the bottom. Loading older messages captures the
scroll offset and restores it afterwards, so prepending history doesn't shove the
paragraph you're reading up off the screen.

**Optimistic sends** appear instantly as `sending`, get patched to `sent` when
the server answers, and are marked `failed` if it doesn't — retryable, with the
text preserved, because losing what someone typed is unforgivable.

**Empty messages** are blocked in the composer's Zod schema (`.trim()` before
`.min(1)`) and again in the send mutation. The API accepts `""` and returns 200,
so the client is the only thing standing between a user and an empty bubble.

**Enter sends, Shift+Enter makes a newline**, and the key handler ignores
`isComposing` so IME input doesn't get committed half-typed.

### The Part 1 bonus

If one thing counts here, I'd point at the search fix. Searching by phone number
in international format — the exact flow the brief describes — returns a 500 from
the API, because the query string is dropped into a MongoDB `$regex` unescaped
and a leading `+` isn't a valid regex. So `src/shared/utils/escape-regexp.ts`
escapes metacharacters before the request goes out, and the API layer refuses an
empty query rather than letting `q=` dump the entire user table.

I want to be straight about how far that gets, though: escaping turns a crash
into a graceful empty state, but it doesn't make E.164 numbers findable, because
the API matches phones by exact equality and the escaped string is no longer
equal to the stored one. Both behaviours are documented in the API doc. It's a
real fix for a real crash, not a fix for the underlying feature.

## Design decisions (Part 2)

The visual direction is deliberately quiet — a near-neutral surface palette, one
desaturated green accent, generous type, almost no chrome. People read chat
clients for hours, and a page promising a calm reading surface ought to look like
one. Colour carries meaning rather than decoration: the accent marks actions and
outgoing messages, and nothing else competes with it.

It's all driven by CSS custom properties in `src/styles/globals.css`, exposed to
Tailwind through `@theme inline`. Light and dark are one token swap. Because the
landing page and the product share the same tokens, the demo in the hero looks
like the real thing — mostly because it *is* the real thing.

**The bonus.** The brief warns that a generic addition won't count, so instead of
a feature card asserting that the scroll behaviour is good, the hero mockup is a
working chat panel running `useStickToBottom` — the same hook the real message
list uses, not a copy of it. Messages stream in on a timer; scroll up mid-stream
and your position holds while a counter collects what arrived; tap the pill to
come back. The composer refuses whitespace exactly like the real one. The page's
central claim is testable in the same viewport that makes it, and because the
demo shares the production hook, breaking the behaviour breaks the demo too.

The illustrations are custom SVG drawn for the sections they sit in — a fan-out
for real-time delivery, a held viewport with messages queueing underneath for
scroll anchoring, intersecting circles of members for groups. They use
`currentColor` so they re-theme with the page, and the animated pulses sit behind
`motion-reduce:hidden`.

## How I used AI

I used **Claude Code** (Claude Opus) throughout, and it's fair to say it did a
lot of the typing. Where it earned its place:

**Probing the API** was easily the most valuable use. I had it write throwaway
Node scripts that hit every endpoint against the live deployment — happy paths,
permission boundaries, malformed input, pagination edges, and deliberately silly
inputs — and then wrote the documentation from what actually came back rather
than from the Swagger page. The regex injection, the inclusive cursor and the
exact-match phone search all came out of that, and I don't think I'd have found
any of them by reading the spec.

**Drafting** the API documentation and this README, and **scaffolding** the
repetitive parts: one file per endpoint, barrels, Zod schemas, the icon set.

What I changed, rejected, or had to go back and fix:

**The first version of the API docs contained a confident, wrong finding.** An
early probe suggested `POST /auth/login` echoed the submitted name without
persisting it. What had actually happened was that another candidate logged into
the same demo phone number in between my two requests — the database is shared.
Re-probing with unique numbers disproved it, and I corrected both the document
and the code comment that had been written around it. The lesson I'd draw is that
the tool is confident either way, and only re-testing tells you which.

**Two `react-hooks/set-state-in-effect` errors**, where the obvious move is a
disable comment. Instead the socket status moved to `useSyncExternalStore` over
the socket client — the socket is an external system that already holds the
truth, so React should subscribe to it rather than mirror it into state — and the
composer's per-conversation draft reset became a `key` prop, which is React's own
idiom. Both ended up better than what the linter complained about.

**A stale-name bug I only found by using the app.** The header showed one name
and the group member list showed another. The cached user was being passed as
React Query's `initialData`, which is treated as freshly fetched, so with a
five-minute `staleTime` it never revalidated — while conversation member lists
came back fresh from the server. Switching to `placeholderData` fixed it, since
that paints immediately and still fetches. Nothing in the type system or the
linter would have caught it.

**A circular dependency between two feature barrels**, created when I first put
the modal composition inside the `conversation` feature. Moved to the route.

**shadcn/ui**, dropped for the reasons above.

## Assumptions I made

The brief said to make reasonable assumptions and note them, so:

- **Phone numbers are normalised to E.164 client-side before login.** The API
  stores whatever you send, verbatim, so `0170…`, `880170…` and `+880170…` become
  three different accounts for one person. Normalising is the only way to stop a
  user accidentally creating a duplicate by typing their own number differently.
- **`/auth/me` is authoritative for the display name**, not the login response
  and not the cached copy — because the shared database means the name can change
  underneath you.
- **Both parts ship from one deployment.** The brief asks for two links; a single
  Next app serving `/` and `/chat` seemed more honest than two projects sharing a
  codebase.
- **Sends go over REST, not the socket.** Both work. REST gives a clearer
  success/failure signal for optimistic UI.
- **A group needs three people**, because the API enforces it, so the UI says so
  up front rather than letting you submit and get rejected.

## What I'd do with more time

Roughly in the order I think matters:

1. **Tests.** There are none, and the two places that most need them are the
   scroll-anchoring hook and the message-cache merge — both stateful, both full
   of edge cases, both exactly the sort of thing that regresses without anyone
   noticing. Playwright for login → send → receive, unit tests for the merge.
2. **Virtualise the message list.** Every loaded message is in the DOM. Fine for
   a demo conversation, not for a real thread.
3. **An offline send queue.** Failed sends are retryable by hand; they should
   drain by themselves on reconnect.
4. **Unread counts and typing indicators.** Both need API support that doesn't
   exist yet — see the redesign section of the API doc.
5. **A proper screen-reader pass.** The semantics, labels and focus states are
   there and the dialog is built on the native element, but I haven't driven the
   app with a screen reader, and I won't claim it's verified until I have.

---

## Issues I ran into with the API

Full detail, with reproductions, is in
[`docs/api-documentation.md` §8](docs/api-documentation.md#8-findings--bugs--inconsistencies).
These are the ones that changed how the client is built.

**1. `/users/search?q=` is a regex injection.** The query goes into a MongoDB
`$regex` unescaped. Searching a phone number in international format — typing the
`+` that the login screen asks for — returns **500**
(`quantifier does not follow a repeatable item`). `(` and `[` fail the same way,
and `q=.*` returns every user in the database. This breaks the brief's own stated
flow. *Worked around* by escaping metacharacters before the request and refusing
an empty `q`.

**2. Search doesn't match the way you'd expect, and E.164 numbers are
unfindable.** `name` is prefix-anchored, `phone` is exact whole-string equality —
so `q=559020` won't find the phone `5590204983`. Combined with (1), a number
stored as `+8801712345678` can't be found at all: raw returns 500, escaped
returns zero hits because the escaped string is no longer equal, and dropping the
`+` doesn't match either. There's no client-side fix; searching by name works.

**3. The `before` pagination cursor is inclusive.** `?before=<id>` returns that
same message again as the first item of the next page, so naive pagination
duplicates one message at every boundary. *Worked around* by de-duplicating on id
when merging pages.

**4. Empty and whitespace-only messages are accepted with a 200.** The brief
requires they not be sendable; the API persists them happily, and you can see
other candidates' blank messages in the shared database. *Worked around* by
validating client-side in two places.

**5. Starting a conversation with yourself returns someone else's conversation.**
`POST /conversations { userId: <your own id> }` answers 200 with an unrelated
existing conversation instead of rejecting. *Worked around* by filtering the
current user out of search results.

**6. A missing token is `400 NO_TOKEN`, not `401`.** An invalid token *is* 401.
Any client keying "session expired" off the status alone silently misses the
first case. *Worked around* by matching on error code as well as status.

**7. Malformed ObjectIds return `500` with raw Mongoose text** — e.g.
`Cast to ObjectId failed for value "nope" ... for model "User"` — leaking the
ORM, the model names and the schema paths. Should be a 400 or a 404. *Worked
around* by never showing a 5xx message to the user.

**8. Four different response envelopes**: bare object, bare array,
`{ data: [] }`, and `{ messages: [], hasMore }`, with no rule connecting shape to
endpoint. The two conversation-creation endpoints disagree with each other on
both status code (200 vs 201) and response shape (thin stub vs fully hydrated).
*Worked around* by unwrapping and normalising per endpoint at the boundary.

**9. Smaller things.** `limit` is unvalidated and uncapped — `0`, `-1` and `9999`
all return the entire history. `lastMessage` is `{}` rather than `null` when
empty. Direct conversations expose `participant` (singular, excluding you) while
groups expose `participants` (plural, including you). `error.code` is usually a
string but is sometimes a number. There's no `GET /conversations/:id`, so a deep
link has to fetch the whole list to resolve one row. And `/health` is documented
under `/api` but actually served from the host root.

Finally, one thing that isn't a bug but caught me out badly enough to be worth
saying: **the database is shared, public and unseeded.** Every candidate reads and
writes the same data. Obvious demo numbers are in active use by other people, and
since login rewrites the account name on every call, your own account can be
renamed underneath you mid-session. That's what produced the incorrect finding I
described above, and later it renamed my own test account. If you're testing
this, use a phone number nobody else would guess.
