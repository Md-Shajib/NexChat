import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/cn";

import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:outline-accent",
  secondary:
    "bg-surface-raised text-foreground hover:bg-surface-hover border border-border",
  ghost: "text-muted hover:bg-surface-hover hover:text-foreground",
  danger: "bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

/**
 * Business-agnostic button primitive.
 *
 * `isLoading` disables the button as well as showing a spinner — a loading
 * button that is still clickable is a double-submit waiting to happen.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {isLoading ? <Spinner className="size-4" /> : null}
        {children}
      </button>
    );
  },
);
