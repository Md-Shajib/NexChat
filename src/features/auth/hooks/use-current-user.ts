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
 * down.
 *
 * The localStorage copy is passed as `placeholderData`, NOT `initialData`.
 * That distinction matters: `initialData` is written into the cache and treated
 * as freshly fetched, so with a non-zero `staleTime` the query would not
 * revalidate on mount and a stale name could persist for the whole session.
 * `placeholderData` paints instantly *and* always fetches.
 *
 * This is not hypothetical. The API's database is shared and public, and
 * `POST /auth/login` rewrites the account name on every call, so another client
 * can rename the account behind a phone number at any time. With `initialData`
 * the header kept rendering the name captured at login while conversation
 * member lists — which come fresh from `GET /conversations` — showed the
 * server's current name. Same account, two sources, one of them stale.
 */
export function useCurrentUser() {
  const token = useAuthStore(selectToken);
  const cachedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    enabled: token !== null,
    placeholderData: cachedUser ?? undefined,
    staleTime: 5 * 60_000,
  });

  // Keep the localStorage mirror in step with the server's answer. The database
  // is shared and public, so another client can rename an account under us;
  // /auth/me is authoritative and the cache is only a first-paint optimisation.
  useEffect(() => {
    if (!query.data) return;
    if (
      query.data.id !== cachedUser?.id ||
      query.data.name !== cachedUser?.name
    ) {
      setUser(query.data);
    }
  }, [query.data, cachedUser, setUser]);

  return query;
}
