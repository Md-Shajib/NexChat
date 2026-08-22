"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { appConfig } from "@/config/app-config";
import { isSendableText } from "@/domains/message/message.utils";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";

type MessageComposerProps = {
  onSend: (text: string) => void;
  isSending: boolean;
};

const MAX_ROWS = 6;

/**
 * The composer.
 *
 * A textarea rather than an input so multi-line messages are possible, with
 * Enter to send and Shift+Enter for a newline. It auto-grows up to `MAX_ROWS`,
 * then scrolls.
 *
 * Empty and whitespace-only messages are unsendable — the button is disabled
 * and the Enter handler bails. The API would accept them (it returns 200 for
 * `""`), so this is the only thing enforcing the requirement.
 *
 * The draft is reset per conversation by the caller keying this component on
 * `conversationId` — React's own idiom for "reset state when a prop changes",
 * and cheaper than clearing it from an effect after a render has already
 * committed with the previous conversation's text.
 */
export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = isSendableText(text) && !isSending;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 20;
    el.style.height = `${Math.min(el.scrollHeight, lineHeight * MAX_ROWS)}px`;
  };

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    // Reset the auto-grown height along with the value.
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      textareaRef.current?.focus();
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore Enter while an IME composition is open, or CJK input commits
    // half-typed text as a message.
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const remaining = appConfig.chat.maxMessageLength - text.length;
  const showCounter = remaining <= 200;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 border-t border-border bg-surface p-3"
    >
      <div className="flex-1">
        <label htmlFor="composer" className="sr-only">
          Message
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          autoFocus
          rows={1}
          value={text}
          maxLength={appConfig.chat.maxMessageLength}
          placeholder="Write a message…"
          onChange={(event) => {
            setText(event.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm",
            "placeholder:text-muted",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        />
        {showCounter ? (
          <p
            className={cn(
              "mt-1 text-right text-[11px]",
              remaining < 0 ? "text-danger" : "text-muted",
            )}
          >
            {remaining} characters left
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={!canSend} isLoading={isSending} size="md">
        Send
      </Button>
    </form>
  );
}
