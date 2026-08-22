import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { groupDetailSchema } from "@/domains/group/group.schema";
import type { GroupDetail } from "@/domains/group/group.types";
import { http } from "@/lib/axios/request";

/**
 * Group administration.
 *
 * All four endpoints answer `200` with the **full updated group** — not an
 * empty body — so each one is parsed into a `GroupDetail`. Callers still
 * invalidate the conversation list afterwards, because this payload omits
 * `lastMessage` and so cannot be spliced into a sidebar row wholesale.
 *
 * Permission errors are all `403` with a specific message; see
 * docs/api-documentation.md §6.9.
 */

/** `POST /conversations/:id/participants` — admins only. Idempotent. */
export async function addParticipants(params: {
  conversationId: string;
  userIds: string[];
}): Promise<GroupDetail> {
  return http.post(
    API_ENDPOINTS.conversations.participants(params.conversationId),
    { userIds: params.userIds },
    { schema: groupDetailSchema },
  );
}

/**
 * `DELETE /conversations/:id/participants/:userId`.
 *
 * Admins remove others; **any** member may pass their own id to leave.
 * A non-admin removing someone else gets `403 "Only admins can remove other
 * members"`.
 */
export async function removeParticipant(params: {
  conversationId: string;
  userId: string;
}): Promise<GroupDetail> {
  return http.delete(
    API_ENDPOINTS.conversations.participant(params.conversationId, params.userId),
    { schema: groupDetailSchema },
  );
}

/**
 * `POST /conversations/:id/admins` — promote an existing member.
 *
 * Promoting a non-member is `400 NOT_A_MEMBER`. There is no demote endpoint.
 */
export async function promoteToAdmin(params: {
  conversationId: string;
  userId: string;
}): Promise<GroupDetail> {
  return http.post(
    API_ENDPOINTS.conversations.admins(params.conversationId),
    { userId: params.userId },
    { schema: groupDetailSchema },
  );
}

/**
 * `PATCH /conversations/:id` — rename, admins only.
 *
 * Renaming a direct conversation is `400 NOT_A_GROUP`.
 */
export async function renameGroup(params: {
  conversationId: string;
  name: string;
}): Promise<GroupDetail> {
  return http.patch(
    API_ENDPOINTS.conversations.rename(params.conversationId),
    { name: params.name },
    { schema: groupDetailSchema },
  );
}
