import type { z } from "zod";

import type { lastMessageSchema, messageSchema } from "./message.schema";

export type Message = z.infer<typeof messageSchema>;

export type LastMessage = z.infer<typeof lastMessageSchema>;

/** Delivery state of a message in the UI. Only ever set client-side. */
export type MessageStatus = "sending" | "sent" | "failed";

/**
 * A message as the message list renders it.
 *
 * Optimistic messages exist in the cache before the server has acknowledged
 * them; they carry a temporary `id` and a `clientId` used to reconcile the
 * server's echo (over REST *and* over `message:new`) back onto the same row.
 */
export type ChatMessage = Message & {
  status: MessageStatus;
  /** Present only while the message is optimistic or being reconciled. */
  clientId?: string;
};
