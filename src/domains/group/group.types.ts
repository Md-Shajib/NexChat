import type { Conversation } from "@/domains/conversation";

/** A group is a conversation narrowed to `type: "group"`. */
export type Group = Extract<Conversation, { type: "group" }>;

export type GroupRole = "admin" | "member";

export type GroupMemberAction =
  | "promote"
  | "remove"
  | "leave";
