"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * 1. Menampilkan bar progres tipis 2px di bagian atas saat navigasi lintas rute
 *    agar klik terasa instan tanpa jeda "beku".
 * 2. Melakukan prefetch rute internal otomatis saat pointer hover / touchstart
 *    (~150–300ms sebelum klik selesai) sehingga perpindahan halaman terasa instan.
 */
export function RouteProgress() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const prefetchedRef = useRef<Set<string>>(new Set());

  const clearTimers = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hideRef.current !== null) {
      window.clearTimeout(hideRef.current);
      hideRef.current = null;
    }
  };

  // Selesaikan bar begitu pathname / searchParams berubah.
  const routeKey = `${pathname}?${searchParams.toString()}`;
  useEffect(() => {
    if (!visibleRef.current) return;
    clearTimers();
    setProgress(100);
    hideRef.current = window.setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
      setProgress(0);
    }, 180);
    return clearTimers;
  }, [routeKey]);

  useEffect(() => {
    const resolveInternalHref = (target: EventTarget | null): string | null => {
      if (!(target instanceof Element)) return null;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return null;
      if (anchor.target && anchor.target !== "_self") return null;
      if (anchor.hasAttribute("download")) return null;
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return null;
      }
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return null;
        if (url.pathname.startsWith("/api/")) return null;
        return `${url.pathname}${url.search}`;
      } catch {
        return null;
      }
    };

    const prefetchHref = (href: string) => {
      const current = `${window.location.pathname}${window.location.search}`;
      if (href === current || prefetchedRef.current.has(href)) return;
      if (prefetchedRef.current.size > 60) prefetchedRef.current.clear();
      prefetchedRef.current.add(href);
      router.prefetch(href);
    };

    const onPointerOver = (event: Event) => {
      const href = resolveInternalHref(event.target);
      if (href) prefetchHref(href);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = resolveInternalHref(event.target);
      if (!href) return;
      const current = `${window.location.pathname}${window.location.search}`;
      if (href === current) return;

      clearTimers();
      visibleRef.current = true;
      setVisible(true);
      setProgress(28);
      timerRef.current = window.setInterval(() => {
        setProgress((prev) => (prev < 88 ? prev + (90 - prev) * 0.18 : prev));
      }, 120);
      // Failsafe: tutup bar bila navigasi dibatalkan.
      hideRef.current = window.setTimeout(() => {
        clearTimers();
        visibleRef.current = false;
        setVisible(false);
        setProgress(0);
      }, 6000);
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("touchstart", onPointerOver, { passive: true });
    document.addEventListener("click", onClick, true);

    return () => {
      clearTimers();
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("touchstart", onPointerOver);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2.5px]"
    >
      <div
        className="h-full bg-[image:var(--cta-gradient)] transition-[width,opacity] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
