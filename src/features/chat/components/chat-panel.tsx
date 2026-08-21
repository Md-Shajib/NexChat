"use client";

import { getConversationTitle } from "@/domains/conversation/conversation.utils";
import type { ChatMessage } from "@/domains/message/message.types";
import { useCurrentUser } from "@/features/auth";
import { useConversation } from "@/features/conversation";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
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

  const handleRetry = (message: ChatMessage) => {
    sendMessage.mutate({ conversationId, text: message.text });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface p-3">
        <Avatar
          id={conversation.id}
          name={title}
          isGroup={conversation.type === "group"}
        />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{title}</h1>
          <p className="truncate text-xs text-muted">
            {conversation.type === "group"
              ? `${conversation.members.length} members`
              : conversation.members[0]?.phone}
          </p>
        </div>
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

      <MessageComposer
        conversationId={conversationId}
        isSending={sendMessage.isPending}
        onSend={(text) => sendMessage.mutate({ conversationId, text })}
      />
    </section>
  );
}
