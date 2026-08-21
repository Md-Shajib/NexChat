"use client";

import type { ChatMessage } from "@/domains/message/message.types";
import type { User } from "@/domains/user/user.types";
import { getDisplayName } from "@/domains/user";
import { cn } from "@/shared/utils/cn";
import { formatFullTimestamp, formatMessageTime } from "@/shared/utils/format-date";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  sender: User | null;
  /** Hide the sender name when this continues the previous message's run. */
  isGrouped: boolean;
  /** Only groups need a name label — in a direct chat it's redundant. */
  showSenderName: boolean;
  onRetry?: () => void;
};

export function MessageBubble({
  message,
  isOwn,
  sender,
  isGrouped,
  showSenderName,
  onRetry,
}: MessageBubbleProps) {
  const failed = message.status === "failed";

  return (
    <li
      className={cn(
        "flex w-full",
        isOwn ? "justify-end" : "justify-start",
        isGrouped ? "mt-0.5" : "mt-3",
      )}
    >
      <div
        className={cn(
          "max-w-[min(32rem,80%)] rounded-2xl px-3 py-2 text-sm",
          isOwn
            ? "rounded-br-md bg-bubble-outgoing text-bubble-outgoing-foreground"
            : "rounded-bl-md bg-bubble-incoming text-bubble-incoming-foreground",
          failed && "ring-1 ring-danger",
        )}
      >
        {showSenderName && !isGrouped && !isOwn ? (
          <p className="mb-0.5 text-xs font-semibold opacity-80">
            {sender ? getDisplayName(sender) : "Unknown"}
          </p>
        ) : null}

        {/* `whitespace-pre-wrap` keeps user line breaks; `break-words` stops a
            single long token from blowing out the bubble width. */}
        <p className="whitespace-pre-wrap break-words">{message.text}</p>

        <p className="mt-1 flex items-center justify-end gap-1.5 text-[11px] opacity-70">
          <time
            dateTime={message.createdAt}
            title={formatFullTimestamp(message.createdAt)}
          >
            {formatMessageTime(message.createdAt)}
          </time>

          {isOwn && message.status === "sending" ? <span>· Sending</span> : null}
          {isOwn && failed ? (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium text-danger underline underline-offset-2"
            >
              Failed — retry
            </button>
          ) : null}
        </p>
      </div>
    </li>
  );
}
