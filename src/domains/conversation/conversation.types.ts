import type { z } from "zod";

import type {
  CONVERSATION_TYPES,
  conversationSchema,
  createdConversationSchema,
} from "./conversation.schema";

export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export type Conversation = z.infer<typeof conversationSchema>;

/** The thin object `POST /conversations` answers with. */
export type CreatedConversation = z.infer<typeof createdConversationSchema>;

export type ConversationId = Conversation["id"];
