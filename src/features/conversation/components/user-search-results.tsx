"use client";

import type { User } from "@/domains/user/user.types";
import { getDisplayName } from "@/domains/user";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { IconCheck } from "@/shared/icons";
import { Avatar } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { formatPhoneForDisplay } from "@/shared/utils/phone";

type UserSearchResultsProps = {
  users: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  /** False before the query term is long enough to search. */
  isEnabled: boolean;
  onSelect: (user: User) => void;
  /** Ids currently selected — drives the check mark in multi-select mode. */
  selectedIds?: readonly string[];
  /** Ids that cannot be selected (e.g. already in the group). */
  disabledIds?: readonly string[];
  /** Shown when a disabled row is rendered. */
  disabledLabel?: string;
};

/**
 * Search results list, shared by the new-conversation and new-group flows.
 *
 * Deliberately presentational — the caller owns the query and decides what a
 * selection means, so one list serves both single- and multi-select.
 */
export function UserSearchResults({
  users,
  isLoading,
  isError,
  error,
  isEnabled,
  onSelect,
  selectedIds = [],
  disabledIds = [],
  disabledLabel = "Already added",
}: UserSearchResultsProps) {
  if (!isEnabled) {
    return (
      <EmptyState
        title="Search for someone"
        description="Type a name or a phone number to find people."
      />
    );
  }

  if (isLoading) {
    return (
      <ul className="space-y-3" aria-label="Searching">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return <ErrorState error={error} title="Search failed" />;
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="No one found"
        description="Check the spelling, or try the full phone number."
      />
    );
  }

  return (
    <ul className="-mx-2">
      {users.map((user) => {
        const isSelected = selectedIds.includes(user.id);
        const isDisabled = disabledIds.includes(user.id);

        return (
          <li key={user.id}>
            <button
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => onSelect(user)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-surface-hover",
                isSelected && "bg-accent-soft",
              )}
            >
              <Avatar id={user.id} name={getDisplayName(user)} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {getDisplayName(user)}
                </span>
                <span className="block truncate text-xs text-muted">
                  {isDisabled ? disabledLabel : formatPhoneForDisplay(user.phone)}
                </span>
              </span>

              {isSelected ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <IconCheck className="size-3.5" />
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
