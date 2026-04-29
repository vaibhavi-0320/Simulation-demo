import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import "./CustomCursor.css";
export default function CustomCursor() {
    const dot = useRef(null);
    const ring = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });
    const frameRef = useRef(0);
    useEffect(() => {
        if (typeof window === "undefined")
            return undefined;
        if (window.matchMedia("(max-width: 768px), (pointer: coarse)").matches) {
            return undefined;
        }
        // Enable the CSS rule that hides the native cursor while our custom cursor is active.
        try {
            document.documentElement.classList.add("custom-cursor-enabled");
        }
        catch { }
        const onMouseMove = (event) => {
            mouse.current.x = event.clientX;
            mouse.current.y = event.clientY;
            if (dot.current) {
                dot.current.style.left = `${event.clientX}px`;
                dot.current.style.top = `${event.clientY}px`;
            }
        };
        const animate = () => {
            ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.12;
            ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.12;
            if (ring.current) {
                ring.current.style.left = `${ringPos.current.x}px`;
                ring.current.style.top = `${ringPos.current.y}px`;
            }
            frameRef.current = window.requestAnimationFrame(animate);
        };
        const onMouseOver = (event) => {
            const element = event.target;
            if (!(element instanceof Element))
                return;
            const isTextTarget = Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
            if (isTextTarget) {
                dot.current?.classList.remove("cursor-hover");
                ring.current?.classList.remove("cursor-hover");
                return;
            }
            const isClickable = Boolean(element.closest("button, a, [role='button'], .clickable, label, input[type='submit'], input[type='button'], input[type='checkbox'], input[type='radio']")) || window.getComputedStyle(element).cursor === "pointer";
            if (isClickable) {
                ring.current?.classList.add("cursor-hover");
                dot.current?.classList.add("cursor-hover");
            }
            else {
                ring.current?.classList.remove("cursor-hover");
                dot.current?.classList.remove("cursor-hover");
            }
        };
        const onMouseLeaveWindow = () => {
            dot.current?.classList.remove("cursor-visible");
            ring.current?.classList.remove("cursor-visible");
        };
        const onMouseEnterWindow = () => {
            dot.current?.classList.add("cursor-visible");
            ring.current?.classList.add("cursor-visible");
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseover", onMouseOver);
        document.addEventListener("mouseleave", onMouseLeaveWindow);
        document.addEventListener("mouseenter", onMouseEnterWindow);
        onMouseEnterWindow();
        frameRef.current = window.requestAnimationFrame(animate);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseover", onMouseOver);
            document.removeEventListener("mouseleave", onMouseLeaveWindow);
            document.removeEventListener("mouseenter", onMouseEnterWindow);
            try {
                document.documentElement.classList.remove("custom-cursor-enabled");
            }
            catch { }
            if (frameRef.current) {
                window.cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: dot, className: "cursor-dot" }), _jsx("div", { ref: ring, className: "cursor-ring" })] }));
}
