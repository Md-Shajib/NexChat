import { z } from "zod";

import { objectIdSchema } from "@/domains/user/user.schema";

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
