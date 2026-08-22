import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { userListSchema } from "@/domains/user/user.schema";
import type { User } from "@/domains/user/user.types";
import { http } from "@/lib/axios/request";
import { escapeRegExp } from "@/shared/utils/escape-regexp";

/**
 * `GET /users/search?q=` — find people by name or phone.
 *
 * Returns a **bare array**, not `{ data: [...] }` — the envelope differs from
 * `/conversations` for no obvious reason. There is no pagination and matching
 * is a loose substring, so a short query can return a very large list; callers
 * should debounce and cap what they render.
 *
 * The term is escaped before it is sent. That is a workaround for a server-side
 * bug, not client hygiene: the API drops `q` into a MongoDB `$regex` unescaped,
 * so an unescaped `+` — i.e. any E.164 phone number, which is exactly what the
 * login screen asks users for — makes the endpoint return 500. Escaping keeps
 * the search usable and stops `.*` from dumping the whole user table.
 *
 * See docs/api-documentation.md §6.3 and §8.1.
 */
export async function searchUsers(term: string): Promise<User[]> {
  const safeTerm = escapeRegExp(term.trim());

  // An empty `q` is documented as required but is not enforced — the API would
  // happily return every user in the database. Refuse it here instead.
  if (safeTerm.length === 0) return [];

  return http.get(API_ENDPOINTS.users.search, {
    params: { q: safeTerm },
    schema: userListSchema,
  });
}
