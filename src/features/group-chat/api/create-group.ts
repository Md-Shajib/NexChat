import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { groupDetailSchema } from "@/domains/group/group.schema";
import type { GroupDetail } from "@/domains/group/group.types";
import { http } from "@/lib/axios/request";

export type CreateGroupPayload = {
  name: string;
  /** Ids of the members to add, excluding the creator. At least 2 are required. */
  participantIds: string[];
};

/**
 * `POST /conversations/group` — create a group; the creator becomes the sole
 * admin.
 *
 * Answers `201` with a **fully hydrated group**, unlike its sibling
 * `POST /conversations`, which answers `200` with a thin stub. Same conceptual
 * operation, two different contracts — see docs/api-documentation.md §8.9.
 *
 * A group needs at least three members in total, so `participantIds` must hold
 * at least two ids or the API replies `400 VALIDATION_ERROR`
 * (`"a group needs at least 3 members"`).
 */
export async function createGroup(
  payload: CreateGroupPayload,
): Promise<GroupDetail> {
  return http.post(API_ENDPOINTS.conversations.createGroup, payload, {
    schema: groupDetailSchema,
  });
}
