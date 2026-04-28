const PREFIX = "fintrix_";

function readRaw(key: string) {
  try {
    const primary = localStorage.getItem(PREFIX + key);
    if (primary !== null) {
      return primary;
    }

    const legacy = localStorage.getItem(key);
    if (legacy !== null) {
      return legacy;
    }

    return null;
  } catch {
    return null;
  }
}

export function getUserStorageKey(walletAddress: string, dataType: string): string {
  const scope = walletAddress.slice(-8).toLowerCase();
  return `${dataType}_${scope}`;
}

export const safeStorage = {
  set(key: string, value: unknown) {
    try {
      const sanitized = JSON.stringify(value);
      if (sanitized.length > 500_000) {
        console.warn("[STORAGE] Data too large, skipping:", key);
        return;
      }
      localStorage.setItem(PREFIX + key, sanitized);
    } catch (error) {
      console.warn("[STORAGE] Failed to save:", key, error);
    }
  },
  get<T>(key: string, fallback: T): T {
    try {
      const raw = readRaw(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  append(key: string, item: unknown, maxItems = 50) {
    const existing = this.get(key, [] as unknown[]);
    const updated = [item, ...existing].slice(0, maxItems);
    this.set(key, updated);
  },
  clear(key: string) {
    try {
      localStorage.removeItem(PREFIX + key);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("[STORAGE] Failed to clear:", key, error);
    }
  },
};
