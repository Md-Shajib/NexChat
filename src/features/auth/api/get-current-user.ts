import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { userSchema } from "@/domains/user/user.schema";
import type { User } from "@/domains/user/user.types";
import { http } from "@/lib/axios/request";

/**
 * `GET /auth/me` — the account behind the bearer token.
 *
 * Returns the user object bare, not wrapped in an envelope. Used to restore a
 * session on boot and to verify a stored token is still valid.
 */
export async function getCurrentUser(): Promise<User> {
  return http.get(API_ENDPOINTS.auth.me, { schema: userSchema });
}
