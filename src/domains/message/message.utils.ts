import type { ChatMessage, Message } from "./message.types";

/**
 * Whether a message body is actually sendable.
 *
 * QUIRK: the API happily accepts `""` and `"   "` and returns 200, so this is
 * the only thing standing between a user and an empty bubble. Enforced both in
 * the composer's Zod schema and here, before any optimistic insert.
 */
export function isSendableText(text: string): boolean {
  return text.trim().length > 0;
}

/** Newest-first (the order the API returns) → oldest-first (render order). */
export function toChronological<T extends { createdAt: string }>(
  messages: readonly T[],
): T[] {
  return [...messages].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
}

/**
 * Drop duplicate messages, keeping the first occurrence.
 *
 * QUIRK: the history endpoint's `before` cursor is **inclusive** — requesting
 * `?before=<id>` returns `<id>` again as the first item of the next page. So
 * every page boundary repeats exactly one message unless we collapse it here.
 *
 * See docs/api-documentation.md §8.2.
 */
export function dedupeById<T extends { id: string }>(messages: readonly T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const message of messages) {
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    result.push(message);
  }

  return result;
}

/**
 * Merge a message into a list, de-duplicating by id.
 *
 * Necessary because a message we sent over REST also comes back over the
 * `message:new` socket event — without this the sender sees it twice.
 */
export function upsertMessage(
  messages: readonly ChatMessage[],
  incoming: ChatMessage,
): ChatMessage[] {
  const existingIndex = messages.findIndex(
    (m) =>
      m.id === incoming.id ||
      (incoming.clientId !== undefined && m.clientId === incoming.clientId),
  );

  if (existingIndex === -1) {
    return toChronological([...messages, incoming]);
  }

  const next = [...messages];
  next[existingIndex] = { ...next[existingIndex]!, ...incoming };
  return next;
}

/** Group consecutive messages from the same sender within `windowMs`. */
export function isSameGroup(
  previous: Message | undefined,
  current: Message,
  windowMs = 5 * 60_000,
): boolean {
  if (!previous) return false;
  if (previous.senderId !== current.senderId) return false;
  return Date.parse(current.createdAt) - Date.parse(previous.createdAt) < windowMs;
}
