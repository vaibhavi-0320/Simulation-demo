import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
export function CursorGlow() {
    const dotRef = useRef(null);
    const auraRef = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const auraPos = useRef({ x: 0, y: 0 });
    const raf = useRef(null);
    const pointerSelector = 'a, button, [role="button"], [onClick], .clickable, [class*="btn"], [class*="button"], input, textarea, select, [data-click]';
    const arrowSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L21 12L14 14L12 21L9 14L3 3Z" stroke="rgba(255,255,255,0.95)" stroke-width="1.6" fill="transparent" stroke-linejoin="round"/></svg>`;
    const handSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3v6" stroke="rgba(255,255,255,0.95)" stroke-width="1.6" stroke-linecap="round"/><path d="M12 5v6" stroke="rgba(255,255,255,0.95)" stroke-width="1.6" stroke-linecap="round"/><path d="M15 8v5" stroke="rgba(255,255,255,0.95)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 14c0-3 2-5 6-5s6 2 6 5v5H5v-5z" stroke="rgba(255,255,255,0.95)" stroke-width="1.2" fill="transparent" stroke-linejoin="round"/></svg>`;
    useEffect(() => {
        const onMove = (event) => {
            pos.current = { x: event.clientX, y: event.clientY };
        };
        const onEnter = () => {
            if (dotRef.current)
                dotRef.current.style.opacity = '1';
            if (auraRef.current)
                auraRef.current.style.opacity = '1';
        };
        const onLeave = () => {
            if (dotRef.current)
                dotRef.current.style.opacity = '0';
            if (auraRef.current)
                auraRef.current.style.opacity = '0';
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener('mouseenter', onEnter);
        window.addEventListener('mouseleave', onLeave);
        const animate = () => {
            const { x, y } = pos.current;
            // Hide cursor during loading-screen
            const hidden = typeof document !== 'undefined' && document.body.classList.contains('loading-screen');
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
                dotRef.current.style.opacity = hidden ? '0' : '1';
            }
            auraPos.current.x += (x - auraPos.current.x) * 0.12;
            auraPos.current.y += (y - auraPos.current.y) * 0.12;
            if (auraRef.current) {
                auraRef.current.style.transform = `translate(${auraPos.current.x - 20}px, ${auraPos.current.y - 20}px)`;
                auraRef.current.style.opacity = hidden ? '0' : '1';
            }
            // Determine whether pointer (over interactive) or default arrow
            try {
                const el = document.elementFromPoint(x, y);
                const isPointer = !!(el && el.matches && el.matches(pointerSelector));
                if (dotRef.current) {
                    dotRef.current.innerHTML = isPointer ? handSvg : arrowSvg;
                    dotRef.current.style.width = '24px';
                    dotRef.current.style.height = '24px';
                    dotRef.current.style.borderRadius = isPointer ? '6px' : '4px';
                    dotRef.current.style.boxShadow = '0 0 10px rgba(147,197,253,0.9), 0 0 24px rgba(147,197,253,0.45)';
                    dotRef.current.style.background = 'transparent';
                }
            }
            catch (e) {
                // ignore
            }
            raf.current = window.requestAnimationFrame(animate);
        };
        raf.current = window.requestAnimationFrame(animate);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener('mouseenter', onEnter);
            window.removeEventListener('mouseleave', onLeave);
            if (raf.current !== null)
                window.cancelAnimationFrame(raf.current);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: dotRef, style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 99999,
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: 'transparent',
                    pointerEvents: 'none',
                    transition: 'opacity 0.12s linear, transform 0.08s linear',
                    willChange: 'transform',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                } }), _jsx("div", { ref: auraRef, style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 99998,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(147,197,253,0.04)',
                    boxShadow: '0 0 20px rgba(147,197,253,0.12)',
                    pointerEvents: 'none',
                    willChange: 'transform',
                    transition: 'opacity 0.12s linear',
                } })] }));
}
