import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { appConfig } from "@/config/app-config";
import { env } from "@/config/env";
import { storage } from "@/shared/lib/storage";
import { toApiError } from "@/shared/lib/api-error";

/**
 * The single Axios instance for the app.
 *
 * Components never import this — only `features/*\/api` modules do.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { "Content-Type": "application/json" },
});

/**
 * In-memory mirror of the token.
 *
 * Reading `localStorage` on every request is both slow and wrong during SSR,
 * so the auth store pushes the current token here via `setAuthToken`.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  // Fall back to storage on a cold start, before the auth store has hydrated.
  return authToken ?? storage.get(appConfig.auth.tokenStorageKey);
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

/**
 * Called when the API tells us the session is dead. The auth feature registers
 * the real handler; keeping it as a callback avoids a lib → feature import,
 * which would invert the dependency direction.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.isUnauthorized) {
      onUnauthorized?.();
    }
    // Reject with the normalised error so every caller sees one error type.
    return Promise.reject(apiError);
  },
);
