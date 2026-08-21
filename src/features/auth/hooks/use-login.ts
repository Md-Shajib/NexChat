"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { reportError } from "@/shared/lib/error-handler";

import { login, type LoginPayload, type LoginResult } from "../api/login";
import { useAuthStore } from "../store/auth.store";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<LoginResult, unknown, LoginPayload>({
    mutationFn: login,

    onSuccess: (result) => {
      setSession(result);
      // Seed the cache so the chat shell renders without a /auth/me round-trip.
      queryClient.setQueryData(queryKeys.auth.me(), result.user);
      router.replace(ROUTES.chat);
    },

    onError: (error) => {
      reportError(error, { scope: "auth.login" });
    },
  });
}
