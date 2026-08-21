/**
 * SSR-safe, typed wrapper around `localStorage`.
 *
 * Guards on `typeof window` (the App Router renders these modules on the
 * server) and on quota/private-mode failures, which throw in Safari.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const storage = {
  get(key: string): string | null {
    if (!isBrowser()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota exceeded or storage disabled — the app still works, it just
      // won't survive a reload. Not worth interrupting the user for.
    }
  },

  remove(key: string): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* see above */
    }
  },

  getJSON<T>(key: string): T | null {
    const raw = storage.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt entry — drop it so we don't fail on every subsequent read.
      storage.remove(key);
      return null;
    }
  },

  setJSON(key: string, value: unknown): void {
    try {
      storage.set(key, JSON.stringify(value));
    } catch {
      /* value was not serialisable */
    }
  },
};
