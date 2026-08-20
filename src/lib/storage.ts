// Thin localStorage wrapper — SSR safe.

export const STORAGE_KEYS = {
  society: "sm.society",
  houses: "sm.houses",
  members: "sm.members",
  session: "sm.session",
  seedVersion: "sm.seedVersion",
} as const;

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export function readItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore for prototype */
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}
