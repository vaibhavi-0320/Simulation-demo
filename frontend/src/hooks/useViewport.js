import { useEffect, useState } from "react";
export function useViewport() {
    const [width, setWidth] = useState(() => typeof window === "undefined" ? 1280 : window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return {
        width,
        isMobile: width < 768,
        isTablet: width < 1024,
    };
}
