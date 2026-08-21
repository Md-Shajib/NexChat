/**
 * Phone handling.
 *
 * QUIRK: the API stores the phone string verbatim — `0149030091`,
 * `880149030091` and `+880149030091` are three different accounts. Nothing
 * server-side normalises them, so we normalise on the way in to stop a user
 * silently creating a duplicate account by typing their number differently.
 */
const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

/** Strip spaces, dashes and brackets; keep a single leading `+`. */
export function normalisePhone(input: string): string {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function isValidPhone(input: string): boolean {
  return E164_PATTERN.test(normalisePhone(input));
}

/** `+8801700000002` → `+880 1700 000002`, purely for display. */
export function formatPhoneForDisplay(phone: string): string {
  const normalised = normalisePhone(phone);
  if (!normalised.startsWith("+")) return normalised;
  const digits = normalised.slice(1);
  if (digits.length <= 6) return normalised;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`.trim();
}
