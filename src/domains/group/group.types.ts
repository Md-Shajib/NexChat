import type { z } from "zod";

import type { Conversation } from "@/domains/conversation";

import type { groupDetailSchema } from "./group.schema";

/** A group is a conversation narrowed to `type: "group"`. */
export type Group = Extract<Conversation, { type: "group" }>;

/** What the group creation and management endpoints return. */
export type GroupDetail = z.infer<typeof groupDetailSchema>;

export type GroupRole = "admin" | "member";

export type GroupMemberAction =
  | "promote"
  | "remove"
  | "leave";
