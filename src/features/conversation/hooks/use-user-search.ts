"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { appConfig } from "@/config/app-config";
import { queryKeys } from "@/constants/query-keys";
import type { User } from "@/domains/user/user.types";
import { useAuthStore, selectUser } from "@/features/auth";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { searchUsers } from "../api/search-users";

/**
 * Debounced people search for the "new conversation" flow.
 *
 * `keepPreviousData` holds the last result set while the next one loads, so
 * the list does not blank out on every keystroke.
 */
export function useUserSearch(term: string) {
  const currentUser = useAuthStore(selectUser);
  const debouncedTerm = useDebouncedValue(
    term.trim(),
    appConfig.search.debounceMs,
  );

  const isEnabled = debouncedTerm.length >= appConfig.search.minQueryLength;

  const query = useQuery<User[]>({
    queryKey: queryKeys.users.search(debouncedTerm),
    queryFn: () => searchUsers(debouncedTerm),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
    // Search results are cheap to refetch and go stale quickly as people join.
    staleTime: 15_000,
    // The endpoint includes the caller in its results — starting a
    // conversation with yourself is not a thing, so filter it out here.
    select: (users) => users.filter((user) => user.id !== currentUser?.id),
  });

  return {
    ...query,
    /** True while the user is typing but the debounce has not fired yet. */
    isDebouncing: term.trim() !== debouncedTerm,
    isEnabled,
  };
}
