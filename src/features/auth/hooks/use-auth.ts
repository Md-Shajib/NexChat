"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { disconnectSocket } from "@/lib/websocket/socket-client";

import {
  selectIsHydrated,
  selectToken,
  selectUser,
  useAuthStore,
} from "../store/auth.store";

/** Read-only view of the session, plus logout. */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useAuthStore(selectToken);
  const user = useAuthStore(selectUser);
  const isHydrated = useAuthStore(selectIsHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);

  const logout = useCallback(() => {
    // Order matters: drop the socket before the token so the server sees a
    // clean disconnect rather than a rejected reconnect attempt.
    disconnectSocket();
    clearSession();
    queryClient.clear();
    router.replace(ROUTES.login);
  }, [clearSession, queryClient, router]);

  return {
    token,
    user,
    isAuthenticated: token !== null,
    /** Guard route redirects on this — before hydration we genuinely don't know. */
    isHydrated,
    logout,
  };
}
