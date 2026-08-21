import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { conversationListResponseSchema } from "@/domains/conversation/conversation.schema";
import type { Conversation } from "@/domains/conversation/conversation.types";
import { sortConversations } from "@/domains/conversation/conversation.utils";
import { http } from "@/lib/axios/request";

/**
 * `GET /conversations` — every conversation the current user belongs to.
 *
 * The API wraps the array in `{ data: [...] }` (unlike `/users/search`, which
 * returns a bare array); the schema unwraps it here so callers see a plain
 * `Conversation[]`.
 *
 * Ordering is not guaranteed by the API, so we sort by recency client-side.
 */
export async function getConversations(): Promise<Conversation[]> {
  const conversations = await http.get(API_ENDPOINTS.conversations.list, {
    schema: conversationListResponseSchema,
  });

  return sortConversations(conversations);
}
