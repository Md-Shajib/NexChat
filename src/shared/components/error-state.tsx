"use client";

import { getUserFacingMessage } from "@/shared/lib/error-handler";
import { toApiError } from "@/shared/lib/api-error";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
};

/**
 * The shared error panel — one of the three states.
 *
 * Only offers a retry for errors that could plausibly succeed on a second
 * attempt; a validation failure gets no misleading "Try again" button.
 */
export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
  className,
}: ErrorStateProps) {
  const apiError = toApiError(error);
  const showRetry = Boolean(onRetry) && apiError.isRetryable;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted">
          {getUserFacingMessage(apiError)}
        </p>
      </div>
      {showRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
