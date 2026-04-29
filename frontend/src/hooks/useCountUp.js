import { useEffect, useState } from "react";
export function useCountUp(target, duration = 1800, trigger) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!trigger)
            return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = window.setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                window.clearInterval(timer);
            }
            else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => window.clearInterval(timer);
    }, [trigger, target, duration]);
    return count;
}
