/**
 * Public API of the auth feature.
 *
 * Nothing outside this feature may import from `features/auth/...` directly —
 * only from `@/features/auth`.
 */
export * from "./components";
export * from "./hooks";
export * from "./schemas/login.schema";
export {
  useAuthStore,
  selectIsAuthenticated,
  selectIsHydrated,
  selectToken,
  selectUser,
} from "./store/auth.store";
export type { LoginPayload, LoginResult } from "./api/login";
