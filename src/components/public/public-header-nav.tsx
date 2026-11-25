"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconMenu2, IconX } from "@tabler/icons-react";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Saat di atas atau masih melintasi zona gelap Hero→ROM, pertahankan tinta terang;
  // saat memasuki area Services yang terang, beralih ke permukaan terang tipis.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (!overlay) {
        setOverDarkZone(false);
        return;
      }
      const rom = document.querySelector<HTMLElement>('section[aria-labelledby="rom-heading"]');
      if (rom) {
        setOverDarkZone(rom.getBoundingClientRect().bottom > 88);
      } else {
        setOverDarkZone(y < window.innerHeight * 0.96);
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

  // Menu seluler: kunci scroll halaman, tutup dengan Escape atau klik di luar.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setServicesOpen(false);
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
      setServicesOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
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
      "relative inline-flex h-9 items-center gap-1 rounded-[var(--radius)] px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      !lightInk
        ? isActive
          ? "font-semibold text-[var(--color-primary)] focus-visible:ring-[var(--color-accent)] after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:rounded-full after:bg-[var(--color-accent)]"
          : "text-[var(--color-fg)]/75 hover:text-[var(--color-primary)] focus-visible:ring-[var(--color-accent)]"
        : isActive
          ? "font-semibold text-white focus-visible:ring-[#7DD3FC] focus-visible:ring-offset-[#05070b] after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:rounded-full after:bg-[#38BDF8]"
          : "text-white/70 hover:text-white focus-visible:ring-[#7DD3FC] focus-visible:ring-offset-[#05070b]",
    ].join(" ");

  const mobileItem = (isActive: boolean) =>
    [
      "flex h-11 w-full items-center rounded-[var(--radius)] px-3 text-sm",
      isActive
        ? "bg-[#F1F4F6] font-semibold text-[var(--color-primary)]"
        : "text-[var(--color-fg)] hover:bg-[#F1F4F6]",
    ].join(" ");

  const subItem =
    "block rounded-[var(--radius)] px-3 py-2 text-[13px] leading-5 text-[var(--color-muted)] hover:bg-[#F1F4F6] hover:text-[var(--color-primary)]";

  return (
    <header
      className={[
        overlay ? "fixed" : "sticky",
        "inset-x-0 top-0 z-40 border-b transition-colors duration-200",
        hasBar
          ? open
            ? "border-[var(--color-border)]/70 bg-[#fbfdfc]/95 backdrop-blur-md"
            : lightInk
              ? "border-white/10 bg-[#05070b]/45 backdrop-blur-sm"
              : "border-[var(--color-border)]/60 bg-[#fbfdfc]/65 backdrop-blur-sm"
          : "border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="relative mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-8">
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
                    className="block px-4 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[#F1F4F6]"
                  >
                    Semua layanan
                  </Link>
                  <Link
                    href="/cara-kerja"
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
              "ml-2 hidden h-9 items-center rounded-[var(--radius)] bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:inline-flex",
              !lightInk
                ? "focus-visible:ring-[var(--color-accent)]"
                : "border border-[#38BDF8]/40 focus-visible:ring-[#7DD3FC] focus-visible:ring-offset-[#05070b]",
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
            "flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:hidden",
            !lightInk
              ? "border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[#F1F4F6] focus-visible:ring-[var(--color-accent)]"
              : "border-white/25 text-white hover:bg-white/10 focus-visible:ring-[#7DD3FC] focus-visible:ring-offset-[#05070b]",
          ].join(" ")}
        >
          {open ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
        </button>

        {open && (
          <div
            id="mobile-nav"
            ref={menuRef}
            className="absolute inset-x-0 top-full mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_24px_56px_-34px_rgba(11,18,32,0.5)] lg:hidden"
          >
            <nav aria-label="Navigasi seluler" className="text-sm">
              <Link
                href="/"
                onClick={close}
                aria-current={active === "beranda" ? "page" : undefined}
                className={mobileItem(active === "beranda")}
              >
                Beranda
              </Link>

              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-controls="mobile-services"
                onClick={() => setServicesOpen((value) => !value)}
                className={`${mobileItem(active === "katalog")} justify-between`}
              >
                <span>Layanan</span>
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {servicesOpen && (
                <div
                  id="mobile-services"
                  className="mb-1 ml-3 border-l border-[var(--color-border)] pl-3"
                >
                  <Link href="/services" onClick={close} className={subItem}>
                    Semua layanan
                  </Link>
                  <Link href="/cara-kerja" onClick={close} className={subItem}>
                    Cara kerja
                  </Link>
                  {services.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      onClick={close}
                      className={subItem}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/articles"
                onClick={close}
                aria-current={active === "artikel" ? "page" : undefined}
                className={mobileItem(active === "artikel")}
              >
                Artikel
              </Link>
              <Link
                href="/testimonials"
                onClick={close}
                aria-current={active === "testimoni" ? "page" : undefined}
                className={mobileItem(active === "testimoni")}
              >
                Testimoni
              </Link>

              <Link
                href="/#konsultasi"
                onClick={close}
                className="mt-2 flex h-11 items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent)] text-sm font-semibold text-white hover:brightness-110"
              >
                Konsultasi
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
