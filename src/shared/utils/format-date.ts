import { format, isThisYear, isToday, isYesterday } from "date-fns";

/** `14:32` — the timestamp under a message bubble. */
export function formatMessageTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

/** Full timestamp for a `title` tooltip on hover. */
export function formatFullTimestamp(iso: string): string {
  return format(new Date(iso), "EEEE, d MMMM yyyy 'at' HH:mm");
}

/** `Today` / `Yesterday` / `12 March` — the sticky separator in the message list. */
export function formatDaySeparator(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "d MMMM" : "d MMMM yyyy");
}

/** Compact time for the conversation sidebar, WhatsApp-style. */
export function formatConversationTime(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "dd/MM" : "dd/MM/yy");
}

/** Whether two messages fall on different calendar days. */
export function isDifferentDay(a: string, b: string): boolean {
  return new Date(a).toDateString() !== new Date(b).toDateString();
}
