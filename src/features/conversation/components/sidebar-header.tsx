"use client";

import { getDisplayName } from "@/domains/user";
import { useAuth, useCurrentUser } from "@/features/auth";
import { IconLogout, IconPencilSquare, IconUsers } from "@/shared/icons";
import { Avatar } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatPhoneForDisplay } from "@/shared/utils/phone";

import { useConversationUiStore } from "../store/conversation-ui.store";

/** Identity, plus the two ways to start a conversation. */
export function SidebarHeader() {
  const { data: user, isLoading } = useCurrentUser();
  const { logout } = useAuth();
  const openModal = useConversationUiStore((state) => state.openModal);

  return (
    <header className="flex items-center gap-3 border-b border-border px-3 py-2.5">
      {isLoading || !user ? (
        <>
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </>
      ) : (
        <>
          <Avatar id={user.id} name={getDisplayName(user)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {getDisplayName(user)}
            </p>
            <p className="truncate text-xs text-muted">
              {formatPhoneForDisplay(user.phone)}
            </p>
          </div>
        </>
      )}

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => openModal("new-conversation")}
          aria-label="New conversation"
          title="New conversation"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <IconPencilSquare className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => openModal("new-group")}
          aria-label="New group"
          title="New group"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <IconUsers className="size-5" />
        </button>

        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-danger"
        >
          <IconLogout className="size-5" />
        </button>
      </div>
    </header>
  );
}
