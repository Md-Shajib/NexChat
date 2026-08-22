/**
 * Transport-level shapes shared by every feature's api layer.
 *
 * The upstream API is inconsistent about envelopes — see `docs/api.md`:
 *   - `GET /users/search`                 → a bare array
 *   - `GET /conversations`                → `{ data: [...] }`
 *   - `GET /conversations/:id/messages`   → `{ messages: [...], hasMore }`
 *   - everything else                     → a bare object
 *
 * We model each of those explicitly here and unwrap them at the api boundary,
 * so nothing above the api layer ever has to know which envelope it came from.
 */

/** `{ data: T[] }` — used by the conversation list. */
export type DataEnvelope<T> = {
  data: T[];
};

/** `{ messages: T[], hasMore }` — used by message history. */
export type MessagePageEnvelope<T> = {
  messages: T[];
  hasMore: boolean;
};

/** The normalised page we hand to React Query's infinite query. */
export type CursorPage<T> = {
  items: T[];
  hasMore: boolean;
  /** Cursor to pass as `?before=` for the next (older) page. */
  nextCursor: string | null;
};

/**
 * The API's error body: `{ error: { message, code, details? } }`.
 *
 * `code` is typed `string | number` deliberately: it is normally a string
 * (`VALIDATION_ERROR`), but a MongoDB regex-compile failure surfaces the raw
 * driver code as a **number** (`51091`). See docs/api-documentation.md §8.10.
 */
export type ApiErrorBody = {
  error: {
    message: string;
    code: string | number;
    details?: Array<{ path: string; message: string }>;
  };
};

/** Error codes the API is known to return, plus our client-side additions. */
export const API_ERROR_CODES = {
  noToken: "NO_TOKEN",
  invalidToken: "INVALID_TOKEN",
  validation: "VALIDATION_ERROR",
  notFound: "NOT_FOUND",
  forbidden: "FORBIDDEN",
  server: "SERVER_ERROR",
  /** Client-side only: request aborted or the network was unreachable. */
  network: "NETWORK_ERROR",
  /** Client-side only: response did not match the expected schema. */
  malformedResponse: "MALFORMED_RESPONSE",
  unknown: "UNKNOWN_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
