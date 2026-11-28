"use client";

import { useEffect, useRef } from "react";

/**
 * Sticky hero dengan efek paralaks ringan (60fps, bebas forced reflow):
 * tinggi hero di-cache via ResizeObserver agar scroll handler tidak pernah
 * membaca offsetHeight / getBoundingClientRect secara sinkron.
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

    let heroHeight = Math.max(window.innerHeight, 320);
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / heroHeight));
      el.style.setProperty("--hero-p", progress.toFixed(4));
    };

    const scheduleUpdate = () => {
      if (!rafId) rafId = window.requestAnimationFrame(update);
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.height > 0) {
        heroHeight = Math.max(entry.contentRect.height, 320);
        if (window.scrollY > 0) scheduleUpdate();
      }
    });
    observer.observe(el);

    if (window.scrollY > 0) {
      scheduleUpdate();
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
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
