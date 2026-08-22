"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/constants/query-keys";
import type { ChatMessage } from "@/domains/message/message.types";
import { dedupeById } from "@/domains/message/message.utils";
import type { CursorPage } from "@/types/api";

import { getMessages } from "../api/get-messages";

/**
 * Paginated conversation history, oldest page last.
 *
 * The cursor walks *backwards* (`?before=`), but pages are appended in load
 * order, so `pages[0]` holds the newest messages. `flatMessages` reverses that
 * to a single chronological list for rendering.
 */
export function useMessages(conversationId: string | undefined) {
  const query = useInfiniteQuery<CursorPage<ChatMessage>>({
    queryKey: queryKeys.conversations.messages(conversationId ?? ""),
    enabled: Boolean(conversationId),
    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) => {
      const page = await getMessages({
        conversationId: conversationId!,
        before: pageParam as string | undefined,
      });
      // Everything the server has confirmed is, by definition, "sent".
      return {
        ...page,
        items: page.items.map<ChatMessage>((message) => ({
          ...message,
          status: "sent",
        })),
      };
    },

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  /**
   * Oldest → newest across every loaded page.
   *
   * De-duplicated because the API's `before` cursor is inclusive, so each page
   * boundary repeats one message — see `dedupeById`.
   */
  const messages = useMemo<ChatMessage[]>(() => {
    if (!query.data) return [];
    return dedupeById([...query.data.pages].reverse().flatMap((page) => page.items));
  }, [query.data]);

  return {
    ...query,
    messages,
    isEmpty: query.isSuccess && messages.length === 0,
  };
}
