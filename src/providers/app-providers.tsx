"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";

/**
 * The single client boundary for the whole app.
 *
 * Order matters: `AuthProvider` uses `useQueryClient`, so it must sit inside
 * `QueryProvider`.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
