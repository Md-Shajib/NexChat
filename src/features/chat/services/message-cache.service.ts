import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { ChatMessage } from "@/domains/message/message.types";
import { dedupeById } from "@/domains/message/message.utils";
import type { CursorPage } from "@/types/api";

export type MessagePages = InfiniteData<CursorPage<ChatMessage>>;

/**
 * Every write to the message cache goes through here.
 *
 * Three separate code paths append messages — the optimistic insert, the REST
 * response, and the `message:new` socket event — and all three can fire for
 * the same message. Centralising the merge logic is what stops that turning
 * into duplicate bubbles.
 */

/** Append (or replace) a message on the newest page. */
export function upsertMessageInCache(
  queryClient: QueryClient,
  conversationId: string,
  message: ChatMessage,
): void {
  queryClient.setQueryData<MessagePages>(
    queryKeys.conversations.messages(conversationId),
    (current) => {
      // No history loaded yet — nothing to merge into. The message will arrive
      // with the first page fetch.
      if (!current || current.pages.length === 0) return current;

      const alreadyPresent = current.pages.some((page) =>
        page.items.some(
          (item) =>
            item.id === message.id ||
            (message.clientId !== undefined && item.clientId === message.clientId),
        ),
      );

      if (!alreadyPresent) {
        // The cursor walks backwards, so `pages[0]` is the NEWEST page — a new
        // message belongs at the end of its items, not on the last page.
        return {
          ...current,
          pages: current.pages.map((page, index) =>
            index === 0 ? { ...page, items: [...page.items, message] } : page,
          ),
        };
      }

      // Present already: patch it in place. This is how an optimistic row gets
      // its real id and `status: "sent"`.
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === message.id ||
            (message.clientId !== undefined && item.clientId === message.clientId)
              ? { ...item, ...message }
              : item,
          ),
        })),
      };
    },
  );
}

/** Mark an optimistic message as failed so the UI can offer a retry. */
export function markMessageFailed(
  queryClient: QueryClient,
  conversationId: string,
  clientId: string,
): void {
  queryClient.setQueryData<MessagePages>(
    queryKeys.conversations.messages(conversationId),
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.clientId === clientId
              ? { ...item, status: "failed" as const }
              : item,
          ),
        })),
      };
    },
  );
}

/** Drop an optimistic message entirely (used when a retry is abandoned). */
export function removeMessageFromCache(
  queryClient: QueryClient,
  conversationId: string,
  clientId: string,
): void {
  queryClient.setQueryData<MessagePages>(
    queryKeys.conversations.messages(conversationId),
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.clientId !== clientId),
        })),
      };
    },
  );
}

/**
 * Flatten paginated history into the chronological list the renderer consumes.
 *
 * Pages are reversed because `pages[0]` holds the newest messages, and
 * de-duplicated because the API's `before` cursor is inclusive.
 */
export function flattenMessages(pages: MessagePages | undefined): ChatMessage[] {
  if (!pages) return [];
  return dedupeById([...pages.pages].reverse().flatMap((page) => page.items));
}
