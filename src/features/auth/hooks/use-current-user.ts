"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys } from "@/constants/query-keys";
import type { User } from "@/domains/user/user.types";

import { getCurrentUser } from "../api/get-current-user";
import { selectToken, useAuthStore } from "../store/auth.store";

/**
 * The authoritative current user.
 *
 * Also the token validity check: if the stored JWT has expired, this query
 * fails with an unauthorized error and the Axios interceptor tears the session
 * down. The cached user from localStorage is used as `initialData` so the shell
 * paints immediately instead of flashing a loading state on every reload.
 */
export function useCurrentUser() {
  const token = useAuthStore(selectToken);
  const cachedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    enabled: token !== null,
    initialData: cachedUser ?? undefined,
    staleTime: 5 * 60_000,
  });

  // Keep the localStorage mirror in step with the server's answer — this is
  // what corrects the name after a login that reused an existing phone number.
  useEffect(() => {
    if (query.data && query.data.id !== cachedUser?.id) {
      setUser(query.data);
      return;
    }
    if (query.data && query.data.name !== cachedUser?.name) {
      setUser(query.data);
    }
  }, [query.data, cachedUser, setUser]);

  return query;
}
