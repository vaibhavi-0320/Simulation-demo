const PREFIX = "fintrix_";
function readRaw(key) {
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
    }
    catch {
        return null;
    }
}
export function getUserStorageKey(walletAddress, dataType) {
    const scope = walletAddress.slice(-8).toLowerCase();
    return `${dataType}_${scope}`;
}
export const safeStorage = {
    set(key, value) {
        try {
            const sanitized = JSON.stringify(value);
            if (sanitized.length > 500_000) {
                console.warn("[STORAGE] Data too large, skipping:", key);
                return;
            }
            localStorage.setItem(PREFIX + key, sanitized);
        }
        catch (error) {
            console.warn("[STORAGE] Failed to save:", key, error);
        }
    },
    get(key, fallback) {
        try {
            const raw = readRaw(key);
            if (!raw) {
                return fallback;
            }
            return JSON.parse(raw);
        }
        catch {
            return fallback;
        }
    },
    append(key, item, maxItems = 50) {
        const existing = this.get(key, []);
        const updated = [item, ...existing].slice(0, maxItems);
        this.set(key, updated);
    },
    clear(key) {
        try {
            localStorage.removeItem(PREFIX + key);
            localStorage.removeItem(key);
        }
        catch (error) {
            console.warn("[STORAGE] Failed to clear:", key, error);
        }
    },
};
