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
 * Three things worth knowing:
 *
 * 1. The API returns messages **newest-first**. We reverse to chronological
 *    order here so the render layer never has to think about it.
 * 2. `hasMore` is returned, but the *cursor* is not — `?before=` expects a
 *    message id, so we derive it from the oldest item in the page.
 * 3. `?before=` is **inclusive**: the next page repeats the message the cursor
 *    points at. Callers must de-duplicate by id — `useMessages` and
 *    `flattenMessages` both run the merged list through `dedupeById`.
 *
 * `limit` is always sent explicitly because the API neither validates nor caps
 * it — `0`, `-1` and an omitted value all return the entire history.
 *
 * See docs/api-documentation.md §6.7 and §8.2.
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
