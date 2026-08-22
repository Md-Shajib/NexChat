/**
 * Endpoint paths, relative to `env.apiBaseUrl`.
 *
 * Centralised so a route rename is a one-line change rather than a grep.
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  users: {
    search: "/users/search",
  },
  conversations: {
    list: "/conversations",
    create: "/conversations",
    createGroup: "/conversations/group",
    messages: (id: string) => `/conversations/${id}/messages`,
    rename: (id: string) => `/conversations/${id}`,
    participants: (id: string) => `/conversations/${id}/participants`,
    participant: (id: string, userId: string) =>
      `/conversations/${id}/participants/${userId}`,
    admins: (id: string) => `/conversations/${id}/admins`,
  },
  messages: {
    send: "/messages",
  },
} as const;

/**
 * `/health` is documented under the `/api` base but is actually served from the
 * host **root** — `GET /api/health` returns `404 NOT_FOUND`. It therefore lives
 * here rather than in `API_ENDPOINTS`, which is relative to the REST base.
 *
 * Useful for warming the free-tier dyno before the user reaches login.
 * See docs/api-documentation.md §6.10.
 */
export const HEALTH_URL = "/health" as const;
