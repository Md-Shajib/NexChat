import { z } from "zod";

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { userSchema } from "@/domains/user/user.schema";
import type { User } from "@/domains/user/user.types";
import { http } from "@/lib/axios/request";

export type LoginPayload = {
  phone: string;
  name: string;
};

export type LoginResult = {
  token: string;
  user: User;
};

const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
});

/**
 * `POST /auth/login` — login and registration in one step.
 *
 * The submitted `name` is written to the account on every login, so signing in
 * again with a new name renames you. Registration and login are indistinguishable
 * from the response (both answer `200`), so the UI cannot say "welcome back".
 *
 * NOTE: the database is shared and public, and phone numbers are stored
 * verbatim — see `normalisePhone` for why the client normalises to E.164
 * before this is called.
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  return http.post(API_ENDPOINTS.auth.login, payload, {
    schema: loginResponseSchema,
  });
}
