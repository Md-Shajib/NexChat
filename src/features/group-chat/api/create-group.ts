import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { createdConversationSchema } from "@/domains/conversation/conversation.schema";
import type { CreatedConversation } from "@/domains/conversation/conversation.types";
import { http } from "@/lib/axios/request";

export type CreateGroupPayload = {
  name: string;
  /** Ids of the members to add, excluding the creator. */
  participantIds: string[];
};

/**
 * `POST /conversations/group` — create a group; the creator becomes an admin.
 *
 * Like `POST /conversations`, the response is a thin stub rather than a full
 * conversation, so callers refetch the list afterwards.
 */
export async function createGroup(
  payload: CreateGroupPayload,
): Promise<CreatedConversation> {
  return http.post(API_ENDPOINTS.conversations.createGroup, payload, {
    schema: createdConversationSchema,
  });
}
