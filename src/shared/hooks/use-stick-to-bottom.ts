"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  /** How close to the bottom (px) still counts as "following". */
  thresholdPx?: number;
};

/**
 * Scroll behaviour for a message list.
 *
 * The rule from the brief: auto-scroll to the newest message by default, but
 * never yank the user down while they are reading history. So we track whether
 * they are *pinned* to the bottom and only auto-scroll while that holds. The
 * moment they scroll up, pinning is released until they come back down.
 *
 * Returns `isPinned` so the UI can offer a "jump to latest" affordance, and
 * `unreadWhileAway` so it can say how much they missed.
 */
export function useStickToBottom<T extends HTMLElement>({
  thresholdPx = 120,
}: Options = {}) {
  const containerRef = useRef<T>(null);
  const [isPinned, setIsPinned] = useState(true);
  const [unreadWhileAway, setUnreadWhileAway] = useState(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setIsPinned(true);
    setUnreadWhileAway(0);
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const pinned = distanceFromBottom <= thresholdPx;

    setIsPinned(pinned);
    if (pinned) setUnreadWhileAway(0);
  }, [thresholdPx]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /**
   * Call when a new message lands. Scrolls only if the user is following;
   * otherwise bumps the unread counter.
   *
   * `isOwnMessage` overrides pinning — sending a message is an explicit intent
   * to be at the bottom, so we always follow your own message down.
   */
  const onNewMessage = useCallback(
    ({ isOwnMessage = false }: { isOwnMessage?: boolean } = {}) => {
      if (isPinned || isOwnMessage) {
        // Wait for the DOM to paint the new row before measuring scrollHeight.
        requestAnimationFrame(() => scrollToBottom("smooth"));
      } else {
        setUnreadWhileAway((count) => count + 1);
      }
    },
    [isPinned, scrollToBottom],
  );

  /**
   * Preserve the viewport when older messages are prepended.
   *
   * Without this, loading a page of history makes the content the user is
   * reading jump upward by the height of the newly-inserted block.
   */
  const preserveScrollOnPrepend = useCallback(() => {
    const el = containerRef.current;
    if (!el) return () => {};
    const previousHeight = el.scrollHeight;
    const previousTop = el.scrollTop;

    return () => {
      const nextEl = containerRef.current;
      if (!nextEl) return;
      nextEl.scrollTop = previousTop + (nextEl.scrollHeight - previousHeight);
    };
  }, []);

  return {
    containerRef,
    isPinned,
    unreadWhileAway,
    scrollToBottom,
    onNewMessage,
    preserveScrollOnPrepend,
  };
}
