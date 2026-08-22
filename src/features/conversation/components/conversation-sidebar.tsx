"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { getConversationTitle } from "@/domains/conversation/conversation.utils";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { IconSearch } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils/cn";

import { useConversations } from "../hooks/use-conversations";
import { useConversationUiStore } from "../store/conversation-ui.store";
import { ConversationListItem } from "./conversation-list-item";
import { SidebarHeader } from "./sidebar-header";

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
  const openModal = useConversationUiStore((state) => state.openModal);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = listFilter.trim().toLowerCase();
    if (!term) return data;
    return data.filter((conversation) =>
      getConversationTitle(conversation).toLowerCase().includes(term),
    );
  }, [data, listFilter]);

  return (
    <aside
      className={cn(
        "w-full flex-col border-border bg-surface md:flex md:w-80 md:shrink-0 md:border-r",
        // Mobile is a two-screen flow: the list *is* the /chat screen, and
        // opening a conversation replaces it rather than stacking beneath it.
        // From md up both panes are visible side by side.
        activeId ? "hidden" : "flex",
      )}
    >
      <SidebarHeader />

      <div className="border-b border-border p-3">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            placeholder="Search your chats"
            aria-label="Filter conversations"
            value={listFilter}
            onChange={(event) => setListFilter(event.target.value)}
            className="pl-9"
          />
        </div>
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
            action={
              listFilter ? undefined : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openModal("new-conversation")}
                >
                  Start a conversation
                </Button>
              )
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
