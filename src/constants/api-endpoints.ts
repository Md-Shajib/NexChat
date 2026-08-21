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
  system: {
    health: "/health",
  },
} as const;
