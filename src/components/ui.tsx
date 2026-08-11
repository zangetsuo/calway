"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima um número até o valor alvo. Usa rAF e respeita prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 420) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // duração 0 faz o primeiro frame já chegar no alvo, sem ramo separado
    const span = reduced ? 0 : duration;
    const from = fromRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = span === 0 ? 1 : Math.min((now - start) / span, 1);
      const eased = 1 - (1 - progress) ** 3; // easeOutCubic
      const value = from + (target - from) * eased;
      setDisplay(value);
      fromRef.current = value;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M3.5 8.5 6.5 11.5 12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MinusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function cx(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}
