"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useStickToBottom } from "@/shared/hooks/use-stick-to-bottom";
import { IconArrowDown, IconSend } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

import {
  INCOMING_MESSAGES,
  SEEDED_MESSAGES,
  type DemoMessage,
} from "../data/demo-script";

const INCOMING_INTERVAL_MS = 3200;

function formatClock(minutesAgo: number, now: number): string {
  return new Date(now - minutesAgo * 60_000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * A single "now" for the client, resolved once and then frozen.
 *
 * The demo's timestamps are relative to render time, which the server and the
 * client would disagree about. Reading it through `useSyncExternalStore` — with
 * a server snapshot of `null` — means the markup renders a placeholder on the
 * server and the real clock on the client, with no hydration mismatch and no
 * setState in an effect. `getSnapshot` must be referentially stable, hence the
 * cache rather than a bare `Date.now()`.
 */
let cachedClientNow: number | null = null;

function getClientNow(): number {
  cachedClientNow ??= Date.now();
  return cachedClientNow;
}

const getServerNow = (): null => null;
const subscribeToNothing = () => () => {};

/**
 * The hero's product mockup — a working chat panel, not a screenshot.
 *
 * This is the landing page's argument in one component. The brief singles out
 * one behaviour as the thing to get right: auto-scroll to the newest message,
 * but never drag the reader down while they're looking at history. Describing
 * that in a feature card proves nothing, so the page lets you *do* it —
 * scroll up, watch messages keep arriving, watch your position hold, and pull
 * yourself back with the pill when you're ready.
 *
 * It runs on `useStickToBottom` — the same hook the real message list uses, not
 * a mock of it. If the production scroll behaviour regresses, this demo
 * regresses with it, which is exactly the property you want from a demo.
 */
export function LiveChatDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>(SEEDED_MESSAGES);
  const [isStreaming, setIsStreaming] = useState(true);
  const [draft, setDraft] = useState("");
  const nextIncoming = useRef(0);

  const renderedAt = useSyncExternalStore(
    subscribeToNothing,
    getClientNow,
    getServerNow,
  );

  const {
    containerRef,
    isPinned,
    unreadWhileAway,
    scrollToBottom,
    onNewMessage,
  } = useStickToBottom<HTMLDivElement>({ thresholdPx: 48 });

  const append = useCallback(
    (message: DemoMessage) => {
      setMessages((current) => [...current, message]);
      onNewMessage({ isOwnMessage: message.author === "you" });
    },
    [onNewMessage],
  );

  useEffect(() => {
    if (!isStreaming) return;

    const timer = window.setInterval(() => {
      const text = INCOMING_MESSAGES[nextIncoming.current % INCOMING_MESSAGES.length]!;
      nextIncoming.current += 1;

      append({
        id: `in-${nextIncoming.current}`,
        author: "them",
        name: "Ada",
        text,
        minutesAgo: 0,
      });
    }, INCOMING_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isStreaming, append]);

  const send = () => {
    // Same rule as the real composer: whitespace is not a message.
    if (draft.trim().length === 0) return;
    append({
      id: `you-${Date.now()}`,
      author: "you",
      name: "You",
      text: draft.trim(),
      minutesAgo: 0,
    });
    setDraft("");
  };

  const canSend = draft.trim().length > 0;

  return (
    <div className="relative w-full max-w-md">
      {/* Ambient glow behind the panel — purely decorative. */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_40%,var(--accent)/25,transparent_75%)] blur-2xl"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3 border-b border-border bg-surface-raised px-4 py-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Ada Lovelace</p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isStreaming ? "bg-success" : "bg-muted",
                )}
              />
              {isStreaming ? "typing…" : "paused"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsStreaming((value) => !value)}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            {isStreaming ? "Pause" : "Resume"}
          </button>
        </div>

        <div className="relative">
          <div
            ref={containerRef}
            className="scrollbar-thin h-72 space-y-2 overflow-y-auto px-4 py-3"
          >
            {messages.map((message) => {
              const isOwn = message.author === "you";
              return (
                <div
                  key={message.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      isOwn
                        ? "rounded-br-md bg-bubble-outgoing text-bubble-outgoing-foreground"
                        : "rounded-bl-md bg-bubble-incoming text-bubble-incoming-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="mt-0.5 text-right text-[10px] opacity-60">
                      {renderedAt === null
                        ? "--:--"
                        : formatClock(message.minutesAgo, renderedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {!isPinned && unreadWhileAway > 0 ? (
            <button
              type="button"
              onClick={() => scrollToBottom()}
              className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-lg"
            >
              {unreadWhileAway} new
              <IconArrowDown className="size-3.5" />
            </button>
          ) : null}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-border bg-surface-raised px-3 py-2.5"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Try sending one…"
            aria-label="Demo message"
            className="h-9 flex-1 rounded-full border border-border bg-background px-3.5 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send demo message"
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
              canSend
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : "cursor-not-allowed bg-surface-hover text-muted",
            )}
          >
            <IconSend className="size-4" />
          </button>
        </form>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Live, not a screenshot — scroll up while it&apos;s typing.
      </p>
    </div>
  );
}
