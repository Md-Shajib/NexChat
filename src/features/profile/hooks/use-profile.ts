"use client";

import { useCurrentUser } from "@/features/auth";
import { getDisplayName } from "@/domains/user";
import { formatPhoneForDisplay } from "@/shared/utils/phone";

/**
 * The signed-in user's profile, presentation-ready.
 *
 * The API exposes no profile-update endpoint — `POST /auth/login` will not
 * rename an existing account — so this feature is read-only by necessity.
 * That constraint is documented rather than worked around.
 */
export function useProfile() {
  const { data: user, isLoading, isError, error } = useCurrentUser();

  return {
    user,
    displayName: user ? getDisplayName(user) : null,
    displayPhone: user ? formatPhoneForDisplay(user.phone) : null,
    isLoading,
    isError,
    error,
    /** Renaming is not supported upstream. Kept explicit for callers. */
    isEditable: false as const,
  };
}
