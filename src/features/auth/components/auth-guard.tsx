"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { Spinner } from "@/shared/ui/spinner";

import { useAuth } from "../hooks/use-auth";

/**
 * Client-side route guard for the dashboard segment.
 *
 * The JWT lives in localStorage, which middleware cannot read, so the gate has
 * to run in the browser. Crucially it waits for `isHydrated` — redirecting
 * before the store has read storage would bounce every authenticated user back
 * to the login page on a hard refresh.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6 text-muted" />
      </div>
    );
  }

  return <>{children}</>;
}
