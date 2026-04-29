import { useEffect, useState } from "react";
const PREFIX = "fintrix:skeleton:";
export function usePageSkeleton(key, duration = 1500) {
    const storageKey = `${PREFIX}${key}`;
    const [loading, setLoading] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return window.sessionStorage.getItem(storageKey) !== "seen";
    });
    useEffect(() => {
        if (!loading)
            return;
        const timer = window.setTimeout(() => {
            window.sessionStorage.setItem(storageKey, "seen");
            setLoading(false);
        }, duration);
        return () => window.clearTimeout(timer);
    }, [duration, loading, storageKey]);
    return loading;
}
