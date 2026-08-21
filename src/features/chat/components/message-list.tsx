"use client";

import { useEffect, useRef } from "react";

import { appConfig } from "@/config/app-config";
import type { Conversation } from "@/domains/conversation/conversation.types";
import { findSender } from "@/domains/conversation/conversation.utils";
import type { ChatMessage } from "@/domains/message/message.types";
import { isSameGroup } from "@/domains/message/message.utils";
import type { User } from "@/domains/user/user.types";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { useStickToBottom } from "@/shared/hooks/use-stick-to-bottom";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { isDifferentDay, formatDaySeparator } from "@/shared/utils/format-date";

import { MessageBubble } from "./message-bubble";

type MessageListProps = {
  conversation: Conversation;
  currentUser: User | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadOlder: () => void;
  onRetryMessage: (message: ChatMessage) => void;
  onRetryLoad: () => void;
};

/**
 * The message history.
 *
 * Scroll behaviour is the part worth reading: `useStickToBottom` keeps us
 * pinned to the newest message *only* while the user is already at the bottom.
 * Scroll up to read history and incoming messages stop yanking the viewport —
 * they queue behind a "new messages" pill instead.
 */
export function MessageList({
  conversation,
  currentUser,
  messages,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadOlder,
  onRetryMessage,
  onRetryLoad,
}: MessageListProps) {
  const {
    containerRef,
    isPinned,
    unreadWhileAway,
    scrollToBottom,
    onNewMessage,
    preserveScrollOnPrepend,
  } = useStickToBottom<HTMLDivElement>({
    thresholdPx: appConfig.chat.autoScrollThresholdPx,
  });

  const latest = messages.at(-1);
  const previousLatestId = useRef<string | null>(null);
  const previousCount = useRef(0);
  const restoreScroll = useRef<(() => void) | null>(null);

  // Land at the bottom the first time a conversation's history arrives —
  // instantly, not animated, so it looks like the view opened there.
  const hasDoneInitialScroll = useRef(false);
  useEffect(() => {
    hasDoneInitialScroll.current = false;
    previousLatestId.current = null;
    previousCount.current = 0;
  }, [conversation.id]);

  useEffect(() => {
    if (hasDoneInitialScroll.current || messages.length === 0) return;
    hasDoneInitialScroll.current = true;
    previousLatestId.current = messages.at(-1)?.id ?? null;
    previousCount.current = messages.length;
    scrollToBottom("auto");
  }, [messages, scrollToBottom]);

  // React to a genuinely new newest-message, not to any cache write (an
  // optimistic row being patched to `sent` must not re-trigger a scroll).
  useEffect(() => {
    if (!hasDoneInitialScroll.current || !latest) return;
    if (latest.id === previousLatestId.current) return;

    const isOwnMessage = latest.senderId === currentUser?.id;
    previousLatestId.current = latest.id;
    onNewMessage({ isOwnMessage });
  }, [latest, currentUser?.id, onNewMessage]);

  // Older messages were prepended — restore the reading position.
  useEffect(() => {
    if (restoreScroll.current && messages.length > previousCount.current) {
      restoreScroll.current();
      restoreScroll.current = null;
    }
    previousCount.current = messages.length;
  }, [messages.length]);

  const handleLoadOlder = () => {
    restoreScroll.current = preserveScrollOnPrepend();
    onLoadOlder();
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-3 p-4" aria-label="Loading messages">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className={index % 2 === 0 ? "ml-auto h-12 w-48" : "h-12 w-56"}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={onRetryLoad}
        title="Couldn't load this conversation"
        className="flex-1"
      />
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        className="scrollbar-thin h-full overflow-y-auto px-4 py-3"
      >
        {hasNextPage ? (
          <div className="flex justify-center pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadOlder}
              isLoading={isFetchingNextPage}
            >
              Load earlier messages
            </Button>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send the first one — it'll appear here instantly."
          />
        ) : (
          <ul>
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const showDaySeparator =
                !previous || isDifferentDay(previous.createdAt, message.createdAt);

              return (
                <div key={message.clientId ?? message.id}>
                  {showDaySeparator ? (
                    <li className="my-4 flex justify-center">
                      <span className="rounded-full bg-surface-raised px-3 py-1 text-[11px] font-medium text-muted">
                        {formatDaySeparator(message.createdAt)}
                      </span>
                    </li>
                  ) : null}

                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === currentUser?.id}
                    sender={findSender(conversation, message.senderId, currentUser)}
                    isGrouped={!showDaySeparator && isSameGroup(previous, message)}
                    showSenderName={conversation.type === "group"}
                    onRetry={() => onRetryMessage(message)}
                  />
                </div>
              );
            })}
          </ul>
        )}
      </div>

      {!isPinned && unreadWhileAway > 0 ? (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground shadow-lg"
        >
          {unreadWhileAway} new message{unreadWhileAway > 1 ? "s" : ""} ↓
        </button>
      ) : null}
    </div>
  );
}
