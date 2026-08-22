/**
 * Characters that are special inside a regular expression.
 *
 * This exists because of a server-side bug, not a client-side need: the API
 * interpolates `/users/search?q=` straight into a MongoDB `$regex` without
 * escaping it. `+`, `*`, `?`, `(` and `[` therefore fail to compile and the
 * endpoint answers **500** — which means searching for a phone number in E.164
 * (`+8801700000000`) crashes it, and `.*` dumps the entire user table.
 *
 * See docs/api-documentation.md §8.1.
 */
const REGEXP_SPECIALS = /[.*+?^${}()|[\]\\]/g;

/** Escape a string so it is inert when used as a regex source. */
export function escapeRegExp(value: string): string {
  return value.replace(REGEXP_SPECIALS, "\\$&");
}
