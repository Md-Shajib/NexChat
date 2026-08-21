"use client";

import { create } from "zustand";

import { appConfig } from "@/config/app-config";
import type { User } from "@/domains/user/user.types";
import { setAuthToken } from "@/lib/axios/api-client";
import { storage } from "@/shared/lib/storage";

type AuthState = {
  token: string | null;
  user: User | null;
  /** False until the store has read from localStorage on the client. */
  isHydrated: boolean;
};

type AuthActions = {
  /** Persist a fresh session after a successful login. */
  setSession: (session: { token: string; user: User }) => void;
  /** Refresh the cached user without touching the token (e.g. from /auth/me). */
  setUser: (user: User) => void;
  /** Clear everything — logout, or a rejected token. */
  clearSession: () => void;
  /** Read the persisted session. Called once, from AuthProvider. */
  hydrate: () => void;
};

/**
 * Session state.
 *
 * This is the one exception to "Zustand is for UI state only": the token is
 * client-owned, synchronous, and needed by the Axios interceptor before any
 * React tree exists — modelling it as server state would mean every request
 * waiting on a query to settle.
 *
 * The *user* is mirrored here only for instant first paint; `useCurrentUser`
 * treats `GET /auth/me` as the source of truth.
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setSession: ({ token, user }) => {
    storage.set(appConfig.auth.tokenStorageKey, token);
    storage.setJSON(appConfig.auth.userStorageKey, user);
    setAuthToken(token);
    set({ token, user });
  },

  setUser: (user) => {
    storage.setJSON(appConfig.auth.userStorageKey, user);
    set({ user });
  },

  clearSession: () => {
    storage.remove(appConfig.auth.tokenStorageKey);
    storage.remove(appConfig.auth.userStorageKey);
    setAuthToken(null);
    set({ token: null, user: null });
  },

  hydrate: () => {
    const token = storage.get(appConfig.auth.tokenStorageKey);
    const user = storage.getJSON<User>(appConfig.auth.userStorageKey);
    setAuthToken(token);
    set({ token, user, isHydrated: true });
  },
}));

/** Selectors — components subscribe to the narrowest slice they need. */
export const selectToken = (state: AuthState) => state.token;
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.token !== null;
export const selectIsHydrated = (state: AuthState) => state.isHydrated;
