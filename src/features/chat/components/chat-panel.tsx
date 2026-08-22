"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { getConversationTitle } from "@/domains/conversation/conversation.utils";
import type { ChatMessage } from "@/domains/message/message.types";
import { useCurrentUser } from "@/features/auth";
import { useConversation, useConversationUiStore } from "@/features/conversation";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { IconArrowLeft } from "@/shared/icons";
import { Avatar } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";

import { useMessages } from "../hooks/use-messages";
import { useSendMessage } from "../hooks/use-send-message";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

/**
 * The chat panel — header, history, composer.
 *
 * Composes the conversation and chat features through their public APIs; it
 * owns no data fetching of its own beyond wiring the two together.
 */
export function ChatPanel({ conversationId }: { conversationId: string }) {
  const { data: currentUser } = useCurrentUser();
  const openModal = useConversationUiStore((state) => state.openModal);
  const {
    conversation,
    isLoading: isConversationLoading,
    isError: isConversationError,
    error: conversationError,
    refetch: refetchConversation,
    isNotFound,
  } = useConversation(conversationId);

  const {
    messages,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMessages(conversationId);

  const sendMessage = useSendMessage();

  if (isConversationLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border p-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  if (isConversationError) {
    return (
      <ErrorState
        error={conversationError}
        onRetry={() => void refetchConversation()}
        className="flex-1"
      />
    );
  }

  if (isNotFound || !conversation) {
    return (
      <EmptyState
        className="flex-1"
        title="Conversation not found"
        description="It may have been deleted, or you're no longer a member."
      />
    );
  }

  const title = getConversationTitle(conversation);
  const isGroup = conversation.type === "group";

  const handleRetry = (message: ChatMessage) => {
    sendMessage.mutate({ conversationId, text: message.text });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface p-3">
        {/* Mobile is a two-screen flow, so the panel needs an explicit way
            back to the list. Hidden from md up, where both are on screen. */}
        <Link
          href={ROUTES.chat}
          aria-label="Back to conversations"
          className="-ml-1 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground md:hidden"
        >
          <IconArrowLeft className="size-5" />
        </Link>

        {isGroup ? (
          // Groups get a manageable header; a direct chat has nothing to open,
          // so it stays a plain heading rather than a button that does nothing.
          <button
            type="button"
            onClick={() => openModal("group-details")}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-surface-hover"
          >
            <Avatar id={conversation.id} name={title} isGroup />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{title}</span>
              <span className="block truncate text-xs text-muted">
                {conversation.members.length} members · Manage
              </span>
            </span>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3 p-1">
            <Avatar id={conversation.id} name={title} />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">{title}</h1>
              <p className="truncate text-xs text-muted">
                {conversation.members[0]?.phone}
              </p>
            </div>
          </div>
        )}
      </header>

      <MessageList
        conversation={conversation}
        currentUser={currentUser ?? null}
        messages={messages}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadOlder={() => void fetchNextPage()}
        onRetryMessage={handleRetry}
        onRetryLoad={() => void refetch()}
      />

      {/* Keyed on the conversation so switching chats resets the draft and
          refocuses the input, without an effect reaching in to clear state. */}
      <MessageComposer
        key={conversationId}
        isSending={sendMessage.isPending}
        onSend={(text) => sendMessage.mutate({ conversationId, text })}
      />
    </section>
  );
}
