"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { Conversation } from "@/domains/conversation/conversation.types";
import { useAuthStore, selectToken } from "@/features/auth";

import { getConversations } from "../api/get-conversations";

/**
 * The sidebar list.
 *
 * Kept fresh by socket pushes (`message:new`, `conversation:updated`) rather
 * than polling — see `useConversationSocket`.
 */
export function useConversations() {
  const token = useAuthStore(selectToken);

  return useQuery<Conversation[]>({
    queryKey: queryKeys.conversations.all(),
    queryFn: getConversations,
    enabled: token !== null,
  });
}
