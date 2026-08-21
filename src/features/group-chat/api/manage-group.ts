import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { emptyResponseSchema, http } from "@/lib/axios/request";

/**
 * Group administration.
 *
 * All four endpoints answer with an undocumented body that we do not depend
 * on — success is signalled by the absence of an error, and the canonical
 * state comes from refetching the conversation list. `emptyResponseSchema`
 * makes that explicit rather than inventing a shape we would have to maintain.
 */

/** `POST /conversations/:id/participants` — admins only. */
export async function addParticipants(params: {
  conversationId: string;
  userIds: string[];
}): Promise<null> {
  return http.post(
    API_ENDPOINTS.conversations.participants(params.conversationId),
    { userIds: params.userIds },
    { schema: emptyResponseSchema },
  );
}

/**
 * `DELETE /conversations/:id/participants/:userId`.
 *
 * Admins remove others; passing your own id is how you leave a group.
 */
export async function removeParticipant(params: {
  conversationId: string;
  userId: string;
}): Promise<null> {
  return http.delete(
    API_ENDPOINTS.conversations.participant(params.conversationId, params.userId),
    { schema: emptyResponseSchema },
  );
}

/** `POST /conversations/:id/admins` — promote an existing member. */
export async function promoteToAdmin(params: {
  conversationId: string;
  userId: string;
}): Promise<null> {
  return http.post(
    API_ENDPOINTS.conversations.admins(params.conversationId),
    { userId: params.userId },
    { schema: emptyResponseSchema },
  );
}

/** `PATCH /conversations/:id` — rename, admins only. */
export async function renameGroup(params: {
  conversationId: string;
  name: string;
}): Promise<null> {
  return http.patch(
    API_ENDPOINTS.conversations.rename(params.conversationId),
    { name: params.name },
    { schema: emptyResponseSchema },
  );
}
