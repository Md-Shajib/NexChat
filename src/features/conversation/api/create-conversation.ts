import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { createdConversationSchema } from "@/domains/conversation/conversation.schema";
import type { CreatedConversation } from "@/domains/conversation/conversation.types";
import { http } from "@/lib/axios/request";

export type CreateConversationPayload = {
  /** Id of the other user, from `searchUsers`. */
  userId: string;
};

/**
 * `POST /conversations` — start or reopen a 1-to-1 conversation.
 *
 * Idempotent in practice: calling it twice for the same pair returns the same
 * conversation id rather than creating a duplicate.
 *
 * QUIRK: the response is *not* shaped like a list item — no `type`, no
 * `lastMessage`, and `participants` is a bare id array. We take only the id
 * from it and refetch the list for a fully-formed conversation.
 *
 * QUIRK: passing your **own** id returns `200` with an unrelated existing
 * conversation instead of rejecting, so the caller must never offer the current
 * user as a target — `useUserSearch` filters them out of the results.
 *
 * Errors: a valid-but-unknown id is `400 UNKNOWN_USER`; a *malformed* id is a
 * `500` carrying a raw Mongoose cast error.
 *
 * See docs/api-documentation.md §6.5 and §8.4.
 */
export async function createConversation(
  payload: CreateConversationPayload,
): Promise<CreatedConversation> {
  return http.post(API_ENDPOINTS.conversations.create, payload, {
    schema: createdConversationSchema,
  });
}
