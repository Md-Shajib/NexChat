export const ROUTES = {
  landing: "/",
  login: "/login",
  chat: "/chat",
  conversation: (id: string) => `/chat/${id}`,
  profile: "/profile",
} as const;

/** Routes reachable without a session. Everything else requires auth. */
export const PUBLIC_ROUTES: readonly string[] = [ROUTES.landing, ROUTES.login];
