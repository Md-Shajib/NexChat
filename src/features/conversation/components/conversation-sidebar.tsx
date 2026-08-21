"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { getConversationTitle } from "@/domains/conversation/conversation.utils";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { Input } from "@/shared/ui/input";

import { useConversations } from "../hooks/use-conversations";
import { useConversationUiStore } from "../store/conversation-ui.store";
import { ConversationListItem } from "./conversation-list-item";

/**
 * The conversation list.
 *
 * Handles all three states explicitly — loading (skeleton rows, not a spinner,
 * so the layout doesn't jump), error (with retry), and empty.
 */
export function ConversationSidebar() {
  const params = useParams<{ conversationId?: string }>();
  const activeId = params?.conversationId;

  const { data, isLoading, isError, error, refetch } = useConversations();
  const listFilter = useConversationUiStore((state) => state.listFilter);
  const setListFilter = useConversationUiStore((state) => state.setListFilter);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = listFilter.trim().toLowerCase();
    if (!term) return data;
    return data.filter((conversation) =>
      getConversationTitle(conversation).toLowerCase().includes(term),
    );
  }, [data, listFilter]);

  return (
    <aside className="flex w-full flex-col border-border bg-surface md:w-80 md:border-r">
      <div className="border-b border-border p-3">
        <Input
          type="search"
          placeholder="Search your chats"
          aria-label="Filter conversations"
          value={listFilter}
          onChange={(event) => setListFilter(event.target.value)}
        />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {isLoading ? (
          <ul className="space-y-1 p-3" aria-label="Loading conversations">
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Couldn't load your chats"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={listFilter ? "No matches" : "No conversations yet"}
            description={
              listFilter
                ? "Try a different name."
                : "Search for someone by name or number to start talking."
            }
          />
        ) : (
          <ul>
            {filtered.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeId}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
