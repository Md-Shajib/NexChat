import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { messageSchema } from "@/domains/message/message.schema";
import type { Message } from "@/domains/message/message.types";
import { http } from "@/lib/axios/request";

export type SendMessagePayload = {
  conversationId: string;
  text: string;
};

/**
 * `POST /messages` — send to a direct or group conversation.
 *
 * Returns the persisted message bare (no envelope). The same message is also
 * broadcast over `message:new`, including back to the sender, so the cache
 * must de-duplicate by id — see `upsertMessage`.
 *
 * QUIRK: the API accepts `""` and whitespace-only text and answers 200. Empty
 * messages are rejected client-side before this is ever called.
 */
export async function sendMessage(
  payload: SendMessagePayload,
): Promise<Message> {
  return http.post(API_ENDPOINTS.messages.send, payload, {
    schema: messageSchema,
  });
}
