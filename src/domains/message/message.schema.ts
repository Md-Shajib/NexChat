import { z } from "zod";

import { objectIdSchema } from "@/domains/user/user.schema";

/**
 * A persisted message.
 *
 * `sender` and `conversation` arrive as raw id strings — the API does not
 * populate them — so rendering a sender's name requires a lookup against the
 * conversation's participants. See `domains/conversation/conversation.utils`.
 */
export const messageSchema = z
  .object({
    _id: objectIdSchema,
    conversation: objectIdSchema,
    sender: objectIdSchema,
    text: z.string(),
    createdAt: z.iso.datetime(),
  })
  .transform((raw) => ({
    id: raw._id,
    conversationId: raw.conversation,
    senderId: raw.sender,
    text: raw.text,
    createdAt: raw.createdAt,
  }));

/**
 * `lastMessage` on a conversation summary.
 *
 * QUIRK: when a conversation has no messages the API returns `{}` — an empty
 * object, not `null`. The union below absorbs both.
 */
export const lastMessageSchema = z.union([
  z
    .object({
      text: z.string(),
      sender: objectIdSchema,
      createdAt: z.iso.datetime(),
    })
    .transform((raw) => ({
      text: raw.text,
      senderId: raw.sender,
      createdAt: raw.createdAt,
    })),
  z.object({}).transform(() => null),
  z.null().transform(() => null),
]);
