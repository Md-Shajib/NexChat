import { z } from "zod";

import { objectIdSchema, userSchema } from "@/domains/user/user.schema";

/**
 * Group business rules, expressed once and reused by every form that touches
 * a group. The API itself enforces almost none of these.
 */
export const GROUP_NAME_MIN_LENGTH = 1;
export const GROUP_NAME_MAX_LENGTH = 60;
/** A group is "three or more members" — the creator plus at least two others. */
export const GROUP_MIN_OTHER_PARTICIPANTS = 2;

export const groupNameSchema = z
  .string()
  .trim()
  .min(GROUP_NAME_MIN_LENGTH, "Give the group a name")
  .max(GROUP_NAME_MAX_LENGTH, `Keep it under ${GROUP_NAME_MAX_LENGTH} characters`);

export const groupParticipantIdsSchema = z
  .array(objectIdSchema)
  .min(
    GROUP_MIN_OTHER_PARTICIPANTS,
    `Pick at least ${GROUP_MIN_OTHER_PARTICIPANTS} people`,
  );

/**
 * The group object returned by `POST /conversations/group` and by every group
 * mutation (add/remove member, promote, rename).
 *
 * It is *nearly* a conversation list item but not quite — it carries
 * `createdAt` and omits `lastMessage` — which is why it needs its own schema
 * rather than reusing `conversationSchema`.
 *
 * See docs/api-documentation.md §6.6 and §6.9.
 */
export const groupDetailSchema = z
  .object({
    _id: objectIdSchema,
    type: z.literal("group"),
    name: z.string(),
    createdBy: objectIdSchema,
    admins: z.array(objectIdSchema),
    participants: z.array(userSchema),
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime(),
  })
  .transform((raw) => ({
    id: raw._id,
    type: "group" as const,
    name: raw.name,
    createdBy: raw.createdBy,
    admins: raw.admins,
    members: raw.participants,
    updatedAt: raw.updatedAt,
  }));
