import { z } from "zod";

/**
 * The API uses Mongo's `_id` on every entity. Rather than leak `_id` through
 * the whole app, we normalise to `id` right here at the domain boundary —
 * every layer above works with `id`.
 */
export const objectIdSchema = z
  .string()
  .min(1, "Expected a non-empty id")
  .describe("Mongo ObjectId");

/**
 * `/users/search` omits `createdAt`, `/auth/login` includes it. Modelled as
 * optional rather than as two separate types, since consumers treat them
 * identically.
 */
export const userSchema = z
  .object({
    _id: objectIdSchema,
    name: z.string(),
    phone: z.string(),
    createdAt: z.iso.datetime().optional(),
  })
  .transform((raw) => ({
    id: raw._id,
    name: raw.name,
    phone: raw.phone,
    createdAt: raw.createdAt ?? null,
  }));

export const userListSchema = z.array(userSchema);
