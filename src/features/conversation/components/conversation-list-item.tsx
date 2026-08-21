"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { Conversation } from "@/domains/conversation/conversation.types";
import { getConversationTitle } from "@/domains/conversation/conversation.utils";
import { Avatar } from "@/shared/ui/avatar";
import { cn } from "@/shared/utils/cn";
import { formatConversationTime } from "@/shared/utils/format-date";

type ConversationListItemProps = {
  conversation: Conversation;
  isActive: boolean;
};

export function ConversationListItem({
  conversation,
  isActive,
}: ConversationListItemProps) {
  const title = getConversationTitle(conversation);
  const { lastMessage } = conversation;

  // A group with no messages still has a meaningful timestamp (when it was
  // created or renamed), so fall back to `updatedAt` rather than showing blank.
  const timestamp = lastMessage?.createdAt ?? conversation.updatedAt;

  return (
    <li>
      <Link
        href={ROUTES.conversation(conversation.id)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 transition-colors",
          isActive ? "bg-accent-soft" : "hover:bg-surface-hover",
        )}
      >
        <Avatar
          id={conversation.id}
          name={title}
          isGroup={conversation.type === "group"}
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{title}</span>
            <span className="shrink-0 text-[11px] text-muted">
              {formatConversationTime(timestamp)}
            </span>
          </span>

          <span className="block truncate text-xs text-muted">
            {lastMessage
              ? lastMessage.text.trim() || " "
              : conversation.type === "group"
                ? "No messages yet"
                : "Say hello"}
          </span>
        </span>
      </Link>
    </li>
  );
}
