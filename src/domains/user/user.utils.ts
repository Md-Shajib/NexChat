import type { User } from "./user.types";

/** Up to two letters for an avatar fallback. Handles single-word names. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts.at(-1)![0]}`.toUpperCase();
}

/**
 * Display name for a user.
 *
 * The API allows blank names (it only validates that `name` is present), so we
 * fall back to the phone number rather than render an empty bubble header.
 */
export function getDisplayName(user: Pick<User, "name" | "phone">): string {
  const trimmed = user.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : user.phone;
}

/** Stable, deterministic colour index for a user's avatar. */
export function getAvatarIndex(id: string, buckets: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % buckets;
}
