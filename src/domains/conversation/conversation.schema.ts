import { z } from "zod";

import { lastMessageSchema } from "@/domains/message/message.schema";
import { objectIdSchema, userSchema } from "@/domains/user/user.schema";

export const CONVERSATION_TYPES = ["direct", "group"] as const;

/**
 * A direct conversation as returned by `GET /conversations`.
 *
 * Note `participant` — singular, and already hydrated to the *other* user. The
 * current user is not included.
 */
const rawDirectConversationSchema = z.object({
  _id: objectIdSchema,
  type: z.literal("direct"),
  participant: userSchema,
  lastMessage: lastMessageSchema,
  updatedAt: z.iso.datetime(),
});

/**
 * A group conversation as returned by `GET /conversations`.
 *
 * Here `participants` is plural, hydrated, and *includes* the current user —
 * the opposite convention from `direct`. `admins` stays as raw ids.
 */
const rawGroupConversationSchema = z.object({
  _id: objectIdSchema,
  type: z.literal("group"),
  name: z.string(),
  createdBy: objectIdSchema,
  admins: z.array(objectIdSchema),
  participants: z.array(userSchema),
  lastMessage: lastMessageSchema,
  updatedAt: z.iso.datetime(),
});

/**
 * Normalised conversation.
 *
 * Both variants are flattened onto one shape — `members` always holds the
 * other participants — so the sidebar can render a single list without
 * branching on `type` for anything but the title and avatar.
 */
export const conversationSchema = z
  .discriminatedUnion("type", [
    rawDirectConversationSchema,
    rawGroupConversationSchema,
  ])
  .transform((raw) => {
    const base = {
      id: raw._id,
      lastMessage: raw.lastMessage,
      updatedAt: raw.updatedAt,
    };

    if (raw.type === "direct") {
      return {
        ...base,
        type: "direct" as const,
        name: raw.participant.name,
        members: [raw.participant],
        admins: [] as string[],
        createdBy: null,
      };
    }

    return {
      ...base,
      type: "group" as const,
      name: raw.name,
      members: raw.participants,
      admins: raw.admins,
      createdBy: raw.createdBy,
    };
  });

/** `GET /conversations` → `{ data: [...] }`. */
export const conversationListResponseSchema = z
  .object({ data: z.array(conversationSchema) })
  .transform((raw) => raw.data);

/**
 * `POST /conversations` and `POST /conversations/group` response.
 *
 * QUIRK: this is *not* the same shape as a list item — there is no `type`, no
 * `lastMessage`, and `participants` is a bare id array rather than hydrated
 * users. We therefore treat the create response as a stub carrying only the
 * new id, and refetch the list to get a fully-formed conversation.
 */
export const createdConversationSchema = z
  .object({
    _id: objectIdSchema,
    participants: z.array(objectIdSchema).optional(),
    name: z.string().optional(),
    createdAt: z.iso.datetime().optional(),
  })
  .transform((raw) => ({
    id: raw._id,
    participantIds: raw.participants ?? [],
    name: raw.name ?? null,
  }));
