"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { BrandLogo } from "@/components/brand-logo";

const NAV = [
  { href: "/", label: "Beranda", key: "beranda" },
  { href: "/services", label: "Layanan", key: "katalog" },
  { href: "/articles", label: "Artikel", key: "artikel" },
  { href: "/testimonials", label: "Testimoni", key: "testimoni" },
] as const;

export type PublicNavKey = (typeof NAV)[number]["key"];

type NavService = { name: string; slug: string };

export function PublicHeaderNav({
  active,
  overlay,
  services,
}: {
  active?: PublicNavKey;
  /** Menyatu dengan hero gelap saat halaman di posisi paling atas. */
  overlay: boolean;
  services: NavService[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [overDarkZone, setOverDarkZone] = useState(overlay);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Saat di atas hero gelap, pertahankan tinta terang;
  // tepat saat .parallax-sheet menyentuh header, beralih ke permukaan terang.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (!overlay) {
        setOverDarkZone(false);
        return;
      }
      const sheet = document.querySelector<HTMLElement>(".parallax-sheet");
      if (sheet) {
        setOverDarkZone(sheet.getBoundingClientRect().top > 80);
      } else {
        setOverDarkZone(y < window.innerHeight * 0.92);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overlay]);

  const close = () => {
    setOpen(false);
    setServicesOpen(false);
  };

  // Menu fullscreen seluler & tablet: kunci scroll halaman, fokus ke tombol tutup, tutup dengan Escape.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setServicesOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (!desktop.matches) return;
      setOpen(false);
      setServicesOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  // Teks putih dipakai saat berada di atas zona gelap (Hero → ROM) dan menu tertutup.
  const lightInk = overlay && (!scrolled || overDarkZone) && !open;
  // Permukaan header tipis muncul saat halaman di-scroll atau menu seluler dibuka.
  const hasBar = scrolled || open;

  const deskLink = (isActive: boolean) =>
    [
      "relative inline-flex h-9 items-center gap-1 rounded-[var(--radius)] px-3 text-[16px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      !lightInk
        ? isActive
          ? "font-bold text-[var(--color-primary)] focus-visible:ring-[var(--color-accent)] after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[var(--color-accent)]"
          : "text-[var(--color-fg)]/75 hover:text-[var(--color-primary)] focus-visible:ring-[var(--color-accent)]"
        : isActive
          ? "font-bold text-white focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-[#05070b] after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#34d399]"
          : "text-[#d3d8df] hover:text-white focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-[#05070b]",
    ].join(" ");

  const fullscreenItem = (isActive: boolean) =>
    [
      "flex w-full items-center justify-between py-3 font-heading text-3xl font-bold uppercase tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] sm:text-4xl",
      isActive ? "text-[#34d399]" : "text-white hover:text-[#6EE7B7]",
    ].join(" ");

  return (
    <>
    <header
      className={[
        overlay ? "fixed" : "sticky",
        "inset-x-0 top-0 z-40 transition-colors duration-200",
        hasBar
          ? open
            ? "border-b border-[var(--color-border)]/70 bg-[#fbfdfc]/95 backdrop-blur-md"
            : lightInk
              ? "bg-[#05070b]/45 backdrop-blur-sm"
              : "border-b border-[var(--color-border)]/60 bg-[#fbfdfc]/65 backdrop-blur-sm"
          : "bg-transparent",
      ].join(" ")}
    >
      {lightInk && !open && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 12%, rgba(255,255,255,0.22) 88%, transparent 100%)",
          }}
        />
      )}
      <div className="relative mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 lg:h-[clamp(72px,calc(89*(100vw/1456)),96px)] lg:px-8">
        <Link
          href="/"
          aria-label="TechFixSoftware — Beranda"
          onClick={close}
          className="flex shrink-0 items-center"
        >
          <BrandLogo className="h-9 lg:h-10" priority light={lightInk} />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) =>
            item.key === "katalog" && services.length > 0 ? (
              <details key={item.key} className="group relative">
                <summary
                  aria-current={active === item.key ? "page" : undefined}
                  className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${deskLink(
                    active === item.key
                  )}`}
                >
                  {item.label}
                  <IconChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute left-0 top-full z-50 mt-2 max-h-[min(70vh,26rem)] w-64 overflow-y-auto rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 shadow-[0_18px_44px_-28px_rgba(11,18,32,0.45)]">
                  <Link
                    href="/services"
                    prefetch={true}
                    className="block px-4 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[#F1F4F6]"
                  >
                    Semua layanan
                  </Link>
                  <Link
                    href="/cara-kerja"
                    prefetch={true}
                    className="block px-4 py-2 text-sm text-[var(--color-fg)] hover:bg-[#F1F4F6]"
                  >
                    Cara kerja
                  </Link>
                  <div className="my-1 border-t border-[var(--color-border)]" />
                  {services.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="block px-4 py-2 text-sm text-[var(--color-fg)] hover:bg-[#F1F4F6]"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                prefetch={true}
                aria-current={active === item.key ? "page" : undefined}
                className={deskLink(active === item.key)}
              >
                {item.label}
              </Link>
            )
          )}

          <Link
            href="/#konsultasi"
            className={[
              "ml-2 hidden items-center px-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:inline-flex",
              !lightInk
                ? "h-9 rounded-[12px] bg-[image:var(--cta-gradient)] text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] hover:brightness-105 focus-visible:ring-[var(--color-accent)]"
                : "h-10 rounded-[12px] border-[1.5px] border-white/90 bg-black/15 text-[15px] font-bold text-white backdrop-blur-sm hover:bg-white/15 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-[#05070b]",
            ].join(" ")}
          >
            Konsultasi
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => (open ? close() : setOpen(true))}
          className={[
            "flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius)] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:hidden",
            !lightInk
              ? "border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[#F1F4F6] focus-visible:ring-[var(--color-accent)]"
              : "border-white/30 bg-[#07090d]/45 text-white backdrop-blur-sm hover:bg-[#07090d]/65 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-[#05070b]",
          ].join(" ")}
        >
          {open ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
        </button>
      </div>
    </header>

    {/* Fullscreen Mobile & Tablet Navigation Overlay (< 1024px) */}
    {open && (
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi utama"
        className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col justify-between overflow-hidden px-6 py-5 text-white sm:px-10 sm:py-7 lg:hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 0% 100%, rgba(16,185,129,0.26) 0%, rgba(13,148,136,0.08) 52%, transparent 80%), linear-gradient(165deg, #070c14 0%, #0b1220 55%, #0d1924 100%)",
        }}
      >
        {/* Top bar: tombol tutup X di kiri + logo di kanan */}
        <div className="flex items-center justify-between">
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={() => {
              close();
              toggleRef.current?.focus();
            }}
            className="-ml-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7]"
          >
            <IconX className="h-6 w-6" />
          </button>
          <BrandLogo className="h-8" light />
        </div>

        {/* Menu utama / Drill-down submenu Layanan */}
        <nav
          aria-label="Navigasi seluler dan tablet"
          className="my-auto flex max-h-[calc(100dvh-13rem)] flex-col overflow-y-auto py-4"
        >
          {!servicesOpen ? (
            <div className="space-y-1">
              <Link
                href="/"
                onClick={close}
                aria-current={active === "beranda" ? "page" : undefined}
                className={fullscreenItem(active === "beranda")}
              >
                <span>Beranda</span>
              </Link>

              {services.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setServicesOpen(true)}
                  className={`${fullscreenItem(active === "katalog")} cursor-pointer`}
                >
                  <span>Layanan</span>
                  <IconChevronRight className="h-7 w-7 shrink-0 opacity-80" />
                </button>
              ) : (
                <Link
                  href="/services"
                  onClick={close}
                  aria-current={active === "katalog" ? "page" : undefined}
                  className={fullscreenItem(active === "katalog")}
                >
                  <span>Layanan</span>
                </Link>
              )}

              <Link
                href="/cara-kerja"
                onClick={close}
                className={fullscreenItem(false)}
              >
                <span>Cara Kerja</span>
              </Link>

              <Link
                href="/articles"
                onClick={close}
                aria-current={active === "artikel" ? "page" : undefined}
                className={fullscreenItem(active === "artikel")}
              >
                <span>Artikel</span>
              </Link>

              <Link
                href="/testimonials"
                onClick={close}
                aria-current={active === "testimoni" ? "page" : undefined}
                className={fullscreenItem(active === "testimoni")}
              >
                <span>Testimoni</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setServicesOpen(false)}
                className="mb-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#34d399] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7]"
              >
                <IconChevronLeft className="h-4 w-4" />
                Kembali
              </button>
              <div className="border-b border-white/15 pb-3 font-heading text-2xl font-bold uppercase tracking-tight text-white">
                Layanan
              </div>
              <div className="space-y-1 pt-2">
                <Link
                  href="/services"
                  onClick={close}
                  className="flex items-center justify-between py-2.5 text-lg font-bold text-[#6EE7B7] hover:text-white"
                >
                  <span>Semua Layanan</span>
                  <IconArrowRight className="h-5 w-5" />
                </Link>
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    onClick={close}
                    className="block py-2.5 text-lg font-medium text-white/90 transition-colors hover:text-[#6EE7B7]"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer bawah overlay */}
        <div className="space-y-3 border-t border-white/15 pt-4">
          <Link
            href="/#konsultasi"
            onClick={close}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[image:var(--cta-gradient)] text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105"
          >
            Konsultasi via WhatsApp
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Remote seluruh Indonesia &amp; Rangkasbitung</span>
            <span className="flex items-center gap-1.5 font-medium text-[#34d399]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              Online
            </span>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
