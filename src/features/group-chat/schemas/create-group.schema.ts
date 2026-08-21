import { z } from "zod";

import {
  groupNameSchema,
  groupParticipantIdsSchema,
} from "@/domains/group/group.schema";

export const createGroupSchema = z.object({
  name: groupNameSchema,
  participantIds: groupParticipantIdsSchema,
});

export type CreateGroupFormValues = z.input<typeof createGroupSchema>;
export type CreateGroupFormOutput = z.output<typeof createGroupSchema>;

export const renameGroupSchema = z.object({
  name: groupNameSchema,
});

export type RenameGroupFormValues = z.input<typeof renameGroupSchema>;
