"use client";

import type { ReactNode } from "react";

import { useOnlineStatus } from "@/shared/hooks/use-online-status";

import { useChatSocket } from "../hooks/use-chat-socket";

/**
 * Mounts the socket once for the whole chat segment and surfaces its state.
 *
 * The banner distinguishes "you are offline" from "the server dropped us",
 * because the user can act on the first and only has to wait out the second.
 * It appears only after a real problem — a brief reconnect is not worth a
 * flashing bar.
 */
export function ChatSocketBoundary({ children }: { children: ReactNode }) {
  const { status } = useChatSocket();
  const isOnline = useOnlineStatus();

  const banner = !isOnline
    ? "You're offline. Messages will send once you're back."
    : status === "disconnected"
      ? "Reconnecting to the server…"
      : null;

  return (
    // The chat segment is pinned to the viewport rather than growing with its
    // content: the message list scrolls internally, and `h-full` on that
    // scroller only resolves if every ancestor has a definite height. `dvh`
    // (not `vh`) so the mobile URL bar collapsing doesn't clip the composer.
    <div className="flex h-dvh flex-col overflow-hidden">
      {banner ? (
        <p
          role="status"
          className="shrink-0 bg-surface-raised px-4 py-1.5 text-center text-xs text-muted"
        >
          {banner}
        </p>
      ) : null}
      {children}
    </div>
  );
}
