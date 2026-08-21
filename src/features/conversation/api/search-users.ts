import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { userListSchema } from "@/domains/user/user.schema";
import type { User } from "@/domains/user/user.types";
import { http } from "@/lib/axios/request";

/**
 * `GET /users/search?q=` — find people by name or phone.
 *
 * Returns a **bare array**, not `{ data: [...] }` — the envelope differs from
 * `/conversations` for no obvious reason.
 *
 * The endpoint has no pagination and matches loosely, so a short query can
 * return a very large list; callers should debounce and cap what they render.
 */
export async function searchUsers(term: string): Promise<User[]> {
  return http.get(API_ENDPOINTS.users.search, {
    params: { q: term },
    schema: userListSchema,
  });
}
