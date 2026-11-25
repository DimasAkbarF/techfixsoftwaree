import Link from "next/link";
import { IconArrowRight, IconMessageExclamation } from "@tabler/icons-react";
import { BrandLogo } from "@/components/brand-logo";

const SITE_NAV = [
  { href: "/", label: "Beranda" },
  { href: "/services", label: "Katalog Layanan" },
  { href: "/articles", label: "Artikel" },
  { href: "/testimonials", label: "Testimoni" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-border)]/70">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <BrandLogo className="h-10" />
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            Servis software Android dari rumah. Semua pengerjaan diawali konsultasi WhatsApp dan
            perjanjian, tanpa toko fisik.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Halaman
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block leading-6 text-[var(--color-fg)] hover:text-[var(--color-accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Sebelum servis
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-fg)]">
            {["Device yang bermasalah", "Kabel USB sesuai device", "Keluhan yang bisa diceritakan"].map(
              (item) => (
                <li key={item}>
                  <Link href="/cara-kerja" className="inline-block leading-6 hover:text-[var(--color-accent)]">
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/75 text-[var(--color-secondary)]"
            >
              <IconMessageExclamation className="h-[18px] w-[18px]" stroke={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-fg)]">
                Punya keluhan atau masukan?
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-muted)]">
                Kami siap mendengar dan memberikan solusi terbaik untuk Anda.
              </p>
            </div>
          </div>
          <Link
            href="/#konsultasi"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Sampaikan Keluhan
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-5 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>&copy; {new Date().getFullYear()} TechFixSoftware. Harga final disepakati via WhatsApp.</p>
          <Link href="/admin" className="inline-block leading-6 hover:text-[var(--color-primary)] hover:underline">
            Masuk Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
