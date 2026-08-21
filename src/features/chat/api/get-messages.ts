import { z } from "zod";

import { appConfig } from "@/config/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { messageSchema } from "@/domains/message/message.schema";
import type { Message } from "@/domains/message/message.types";
import { toChronological } from "@/domains/message/message.utils";
import { http } from "@/lib/axios/request";
import type { CursorPage } from "@/types/api";

const messagePageSchema = z.object({
  messages: z.array(messageSchema),
  hasMore: z.boolean(),
});

export type GetMessagesParams = {
  conversationId: string;
  /** Cursor: the id of the oldest message already loaded. */
  before?: string;
  limit?: number;
};

/**
 * `GET /conversations/:id/messages` — one page of history.
 *
 * Two things worth knowing:
 *
 * 1. The API returns messages **newest-first**. We reverse to chronological
 *    order here so the render layer never has to think about it.
 * 2. `hasMore` is returned, but the *cursor* is not — `?before=` expects a
 *    message id, so we derive it from the oldest item in the page.
 */
export async function getMessages({
  conversationId,
  before,
  limit = appConfig.chat.messagePageSize,
}: GetMessagesParams): Promise<CursorPage<Message>> {
  const page = await http.get(API_ENDPOINTS.conversations.messages(conversationId), {
    params: { limit, ...(before ? { before } : {}) },
    schema: messagePageSchema,
  });

  const chronological = toChronological(page.messages);
  const oldest = chronological.at(0);

  return {
    items: chronological,
    hasMore: page.hasMore,
    nextCursor: page.hasMore && oldest ? oldest.id : null,
  };
}
