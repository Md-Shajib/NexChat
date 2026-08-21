/**
 * Every React Query key in the app is derived from this factory.
 *
 * Keys are hierarchical so that a broad prefix invalidates everything beneath
 * it — e.g. `queryKeys.conversations.all` invalidates the list *and* every
 * message history.
 */
export const queryKeys = {
  auth: {
    root: ["auth"] as const,
    me: () => [...queryKeys.auth.root, "me"] as const,
  },

  users: {
    root: ["users"] as const,
    search: (term: string) => [...queryKeys.users.root, "search", term] as const,
  },

  conversations: {
    root: ["conversations"] as const,
    all: () => [...queryKeys.conversations.root, "list"] as const,
    detail: (conversationId: string) =>
      [...queryKeys.conversations.root, "detail", conversationId] as const,
    messages: (conversationId: string) =>
      [...queryKeys.conversations.root, "messages", conversationId] as const,
  },
} as const;
