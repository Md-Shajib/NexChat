"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/features/auth";
import { setUnauthorizedHandler } from "@/lib/axios/api-client";
import { disconnectSocket } from "@/lib/websocket/socket-client";

/**
 * Boots the session and wires up global 401 handling.
 *
 * Two jobs:
 *  1. Hydrate the auth store from localStorage exactly once, on mount. Until
 *     that happens `isHydrated` is false and route guards hold their fire.
 *  2. Register the handler the Axios interceptor calls when the API rejects
 *     our token, so an expired JWT logs the user out from anywhere in the app.
 *     Registering it here (rather than inside `lib/axios`) keeps the lib layer
 *     free of any dependency on a feature.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrate = useAuthStore((state) => state.hydrate);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      disconnectSocket();
      clearSession();
      queryClient.clear();
      router.replace(ROUTES.login);
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession, queryClient, router]);

  return <>{children}</>;
}
