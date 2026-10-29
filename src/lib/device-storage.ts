import { Platform } from "react-native";

function storage(): Storage | null {
  if (Platform.OS !== "web" || typeof globalThis.localStorage === "undefined") {
    return null;
  }
  return globalThis.localStorage;
}

function sessionStorage(): Storage | null {
  if (Platform.OS !== "web" || typeof globalThis.sessionStorage === "undefined") {
    return null;
  }
  return globalThis.sessionStorage;
}

export function readSessionValue<T>(key: string): T | null {
  const store = sessionStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeSessionValue(key: string, value: unknown) {
  const store = sessionStorage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; the session still works in memory.
  }
}

export function removeSessionValue(key: string) {
  const store = sessionStorage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Ignore unavailable storage.
  }
}

export function readLocalValue<T>(key: string): T | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocalValue(key: string, value: unknown) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; the score still shows for this session.
  }
}

export function removeLocalValue(key: string) {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Ignore unavailable storage.
  }
}
