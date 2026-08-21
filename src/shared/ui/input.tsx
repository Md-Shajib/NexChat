import { forwardRef, type InputHTMLAttributes, useId } from "react";

import { cn } from "@/shared/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  /** Validation message. Its presence also drives `aria-invalid`. */
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground",
          "placeholder:text-muted",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />

      {error || hint ? (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-danger" : "text-muted")}
          role={error ? "alert" : undefined}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
});
