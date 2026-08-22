"use client";

import { useState } from "react";

import { getDisplayName } from "@/domains/user";
import type { User } from "@/domains/user/user.types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { formatPhoneForDisplay } from "@/shared/utils/phone";

type GroupMemberRowProps = {
  member: User;
  isAdmin: boolean;
  isSelf: boolean;
  /** Whether the *viewer* may manage this group. */
  canManage: boolean;
  isBusy: boolean;
  onPromote: (userId: string) => void;
  onRemove: (userId: string) => void;
};

/**
 * One member of a group, with the actions the viewer is actually allowed.
 *
 * Removal is destructive and has no undo, so it asks for confirmation inline
 * rather than firing on the first click. An inline confirm is used in
 * preference to `window.confirm` — a native modal blocks the whole tab and
 * looks nothing like the rest of the app.
 */
export function GroupMemberRow({
  member,
  isAdmin,
  isSelf,
  canManage,
  isBusy,
  onPromote,
  onRemove,
}: GroupMemberRowProps) {
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  // You never manage yourself from this row — leaving is a separate, clearly
  // labelled action at the bottom of the panel.
  const showActions = canManage && !isSelf;

  return (
    <li className="flex items-center gap-3 py-2">
      <Avatar id={member.id} name={getDisplayName(member)} size="sm" />

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
          {getDisplayName(member)}
          {isSelf ? <span className="text-xs text-muted">(you)</span> : null}
          {isAdmin ? (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Admin
            </span>
          ) : null}
        </p>
        <p className="truncate text-xs text-muted">
          {formatPhoneForDisplay(member.phone)}
        </p>
      </div>

      {showActions ? (
        isConfirmingRemove ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="sm"
              variant="danger"
              isLoading={isBusy}
              onClick={() => onRemove(member.id)}
            >
              Remove
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsConfirmingRemove(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            {!isAdmin ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={() => onPromote(member.id)}
              >
                Make admin
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={() => setIsConfirmingRemove(true)}
              className="text-danger hover:text-danger"
            >
              Remove
            </Button>
          </div>
        )
      ) : null}
    </li>
  );
}
