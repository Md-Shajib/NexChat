/**
 * Product-level tuning knobs. Separate from `env` on purpose: these are
 * decisions, not deployment configuration.
 */
export const appConfig = {
  name: "Next Chat",
  description: "Real-time one-to-one and group messaging.",

  auth: {
    /** localStorage key holding the JWT. */
    tokenStorageKey: "next-chat.token",
    /** localStorage key holding the cached user, for an instant first paint. */
    userStorageKey: "next-chat.user",
  },

  chat: {
    /** Page size for message history. */
    messagePageSize: 30,
    /**
     * How close to the bottom (px) the user must be for us to treat them as
     * "following" the conversation and auto-scroll on a new message.
     */
    autoScrollThresholdPx: 120,
    /** Max characters accepted in the composer. */
    maxMessageLength: 4000,
  },

  search: {
    /** Debounce before firing a user search. */
    debounceMs: 300,
    /** Below this length we do not query at all — the API requires `q`. */
    minQueryLength: 1,
  },
} as const;

export type AppConfig = typeof appConfig;
