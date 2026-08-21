import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

import { ApiError } from "@/shared/lib/api-error";

const MAX_RETRIES = 2;

const defaultOptions: DefaultOptions = {
  queries: {
    /**
     * Messages arrive over the socket, so cached data is not "stale" in the
     * usual sense — refetching on every focus would cause visible churn in the
     * message list. We rely on socket pushes and invalidate explicitly.
     */
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    retry: (failureCount, error) => {
      if (failureCount >= MAX_RETRIES) return false;
      // Never retry a dead session or a bad request — the outcome won't change.
      if (error instanceof ApiError) return error.isRetryable;
      return false;
    },
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
  },

  mutations: {
    // Mutations are user-initiated and often non-idempotent (sending a
    // message); a silent retry could duplicate it. Retrying is opt-in per hook.
    retry: false,
  },
};

/** Fresh client per call — required so SSR requests never share a cache. */
export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions });
}
