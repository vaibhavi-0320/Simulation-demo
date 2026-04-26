import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type LoadingScreenProps = {
  onComplete: () => void;
};

const FLOW_WORDS = [
  "Upload Invoice",
  "Analyze Risk",
  "Simulate Funding",
  "Generate Yield",
] as const;

const STATUS_LABELS = [
  "Initializing simulation...",
  "Analyzing invoice...",
  "Calculating risk...",
  "Preparing marketplace...",
] as const;

const DURATION_MS = 2200;
const WORD_INTERVAL_MS = 650;
const COMPLETE_DELAY_MS = 100;
const EASE = [0.4, 0, 0.2, 1] as const;

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [brandFlicker, setBrandFlicker] = useState(1);
  const [glitchX, setGlitchX] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Progress (rAF) — drives counter + bar
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const cleanupTimeoutRef = { current: 0 as number };

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        const t = window.setTimeout(() => onCompleteRef.current(), COMPLETE_DELAY_MS);
        cleanupTimeoutRef.current = t;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    };
  }, []);

  // Word + status sequence (no loop)
  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i < FLOW_WORDS.length; i++) {
      timers.push(
        window.setTimeout(() => setWordIndex(i), i * WORD_INTERVAL_MS),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Subtle brand flicker
  useEffect(() => {
    const id = window.setInterval(() => {
      const r = Math.random();
      setBrandFlicker(r > 0.9 ? 0.55 + Math.random() * 0.25 : 1);
    }, 180);
    return () => clearInterval(id);
  }, []);

  // Subtle horizontal glitch shift on word changes
  useEffect(() => {
    const sign = Math.random() > 0.5 ? 1 : -1;
    const magnitude = 1 + Math.random(); // 1–2px
    setGlitchX(sign * magnitude);
    const t = window.setTimeout(() => setGlitchX(0), 120);
    return () => clearTimeout(t);
  }, [wordIndex]);

  const counterValue = Math.round(progress).toString().padStart(3, "0");
  const isComplete = progress >= 100;

  return (
    <motion.div
      className="fintrix-loader fixed inset-0 z-[9999] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Brand — top-left */}
      <motion.div
        className="absolute left-6 top-6 md:left-10 md:top-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
      >
        <div className="flex items-center gap-3" style={{ opacity: brandFlicker }}>
          <img src="/fintrix-brand.png" alt="Fintrix" className="h-10 w-10 object-contain" />
          <span className="fintrix-brand fintrix-italic-serif text-base tracking-wide md:text-lg">Fintrix</span>
        </div>
      </motion.div>

      {/* Center flow words */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIndex}
            className="text-center text-4xl font-medium text-white/90 md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: glitchX }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {FLOW_WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bottom-right: status + counter */}
      <motion.div
        className="absolute bottom-6 right-6 flex flex-col items-end md:bottom-10 md:right-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIndex}
            className="fintrix-text-muted mb-2 text-xs uppercase tracking-wider"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {STATUS_LABELS[wordIndex]}
          </motion.span>
        </AnimatePresence>
        <span
          className={`text-6xl font-semibold tabular-nums text-white md:text-8xl lg:text-9xl ${
            isComplete ? "fintrix-counter-glow" : ""
          }`}
        >
          {counterValue}
        </span>
      </motion.div>

      {/* Progress bar — bottom */}
      <div className="fintrix-stroke-bg absolute bottom-0 left-0 h-[3px] w-full">
        <motion.div
          className="fintrix-accent-fill h-full w-full origin-left"
          style={{ scaleX: progress / 100 }}
          transition={{ ease: "linear", duration: 0 }}
        />
      </div>
    </motion.div>
  );
}

export default LoadingScreen;
