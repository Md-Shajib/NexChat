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
 * QUIRK: when the phone number already exists the API echoes back the `name`
 * you submitted, but does **not** persist it — a later `GET /auth/me` returns
 * the name the account was originally created with. Callers should treat
 * `/auth/me` as the source of truth for the display name.
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  return http.post(API_ENDPOINTS.auth.login, payload, {
    schema: loginResponseSchema,
  });
}
