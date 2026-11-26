"use client";

import { useEffect, useRef } from "react";

/**
 * Sticky hero dengan efek paralaks ringan (60fps):
 * konten hero mundur halus dan meredup saat .parallax-sheet di bawahnya meluncur naik.
 */
export function ParallaxHero({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      el.style.setProperty("--hero-p", "0");
      return;
    }

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const height = Math.max(el.offsetHeight, 320);
      const progress = Math.min(1, Math.max(0, window.scrollY / height));
      el.style.setProperty("--hero-p", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-shell hero-home parallax-hero flex items-center"
    >
      {children}
    </section>
  );
}
