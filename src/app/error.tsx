"use client";

import { useEffect } from "react";

import { reportError } from "@/shared/lib/error-handler";
import { Button } from "@/shared/ui/button";

/**
 * Root error boundary.
 *
 * Errors are logged rather than swallowed, and the raw message is never shown —
 * it can contain server internals.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, {
      scope: "app.rootBoundary",
      meta: { digest: error.digest },
    });
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted">
          The page hit an unexpected error. Trying again usually clears it.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
