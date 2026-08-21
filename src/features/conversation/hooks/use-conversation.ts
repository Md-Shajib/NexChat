"use client";

import { useMemo } from "react";

import type { Conversation } from "@/domains/conversation/conversation.types";

import { useConversations } from "./use-conversations";

/**
 * A single conversation, derived from the list.
 *
 * The API has no `GET /conversations/:id`, so the list is the only source for
 * conversation metadata. Deriving rather than refetching also means the header
 * updates instantly when a `conversation:updated` event patches the list.
 */
export function useConversation(conversationId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useConversations();

  const conversation = useMemo<Conversation | null>(() => {
    if (!conversationId || !data) return null;
    return data.find((item) => item.id === conversationId) ?? null;
  }, [data, conversationId]);

  return {
    conversation,
    isLoading,
    isError,
    error,
    refetch,
    /** The list loaded but this id is not in it — a stale or foreign link. */
    isNotFound: !isLoading && !isError && data !== undefined && conversation === null,
  };
}
