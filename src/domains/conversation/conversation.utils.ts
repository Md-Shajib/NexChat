import { getDisplayName, type User } from "@/domains/user";

import type { Conversation } from "./conversation.types";

/** Title shown in the sidebar row and the chat header. */
export function getConversationTitle(conversation: Conversation): string {
  if (conversation.type === "group") {
    return conversation.name.trim() || "Unnamed group";
  }
  const [other] = conversation.members;
  return other ? getDisplayName(other) : "Unknown contact";
}

/**
 * Resolve a sender id to a user.
 *
 * Messages carry only `senderId`, and for a direct conversation the API omits
 * the current user from `members` entirely — so the caller must supply
 * `currentUser` for own-message lookups to resolve.
 */
export function findSender(
  conversation: Conversation,
  senderId: string,
  currentUser: User | null,
): User | null {
  if (currentUser && currentUser.id === senderId) return currentUser;
  return conversation.members.find((member) => member.id === senderId) ?? null;
}

export function isAdmin(conversation: Conversation, userId: string): boolean {
  return conversation.admins.includes(userId);
}

/** Only groups have admins; direct conversations never grant management. */
export function canManageGroup(
  conversation: Conversation,
  userId: string | undefined,
): boolean {
  if (conversation.type !== "group" || !userId) return false;
  return isAdmin(conversation, userId);
}

/**
 * Sort key for the sidebar.
 *
 * Prefers `lastMessage.createdAt` and falls back to `updatedAt`, because a
 * group that was renamed but never messaged has an `updatedAt` newer than its
 * (absent) last message.
 */
export function getConversationTimestamp(conversation: Conversation): number {
  return Date.parse(conversation.lastMessage?.createdAt ?? conversation.updatedAt);
}

export function sortConversations(
  conversations: readonly Conversation[],
): Conversation[] {
  return [...conversations].sort(
    (a, b) => getConversationTimestamp(b) - getConversationTimestamp(a),
  );
}
