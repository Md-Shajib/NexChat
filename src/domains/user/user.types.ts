import type { z } from "zod";

import type { userSchema } from "./user.schema";

export type User = z.infer<typeof userSchema>;

/** A user id, as returned by `/users/search`. */
export type UserId = User["id"];
