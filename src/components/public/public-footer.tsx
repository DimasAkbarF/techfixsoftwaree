import Link from "next/link";
import { IconArrowRight, IconMessageExclamation } from "@tabler/icons-react";
import { BrandLogo } from "@/components/brand-logo";
import { ChatAssistantLazy } from "@/components/public/chat-assistant-lazy";
import { getPublicSiteSetting } from "@/lib/public-data";

const SITE_NAV = [
  { href: "/", label: "Beranda" },
  { href: "/services", label: "Katalog Layanan" },
  { href: "/diagnosa", label: "Diagnosa Cepat" },
  { href: "/cek-servis", label: "Cek Status Servis" },
  { href: "/articles", label: "Artikel" },
  { href: "/testimonials", label: "Testimoni" },
  { href: "/tentang", label: "Tentang Kami" },
];

export async function PublicFooter() {
  const setting = await getPublicSiteSetting();
  const whatsappNumber = setting?.whatsappNumber ?? null;
  return (
    <>
    <footer className="public-footer border-t border-white/10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-8 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] md:gap-10 lg:px-8">
        <div className="col-span-2 max-w-sm md:col-span-1">
          <BrandLogo className="h-10" light />
          <p className="mt-2.5 text-sm leading-relaxed text-white/70">
            Servis software Android dari rumah. Semua pengerjaan diawali konsultasi WhatsApp dan
            perjanjian, tanpa toko fisik.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#34d399]">
            Halaman
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  className="inline-block leading-6 text-white/85 transition-colors hover:text-[#6EE7B7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#34d399]">
            Sebelum servis
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {["Device yang bermasalah", "Kabel USB sesuai device", "Keluhan yang bisa diceritakan"].map(
              (item) => (
                <li key={item}>
                  <Link
                    href="/cara-kerja"
                    prefetch={true}
                    className="inline-block leading-6 transition-colors hover:text-[#6EE7B7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
                  >
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] border border-white/15 bg-white/5 text-[#34d399]"
            >
              <IconMessageExclamation className="h-[18px] w-[18px]" stroke={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Punya keluhan atau masukan?
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                Kami siap mendengar dan memberikan solusi terbaik untuk Anda.
              </p>
            </div>
          </div>
          <Link
            href="/#konsultasi"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[12px] bg-[image:var(--cta-gradient)] px-5 text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
          >
            Sampaikan Keluhan
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 pb-20 pt-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:pb-5 lg:px-8">
          <p>&copy; {new Date().getFullYear()} TechFixSoftware. Harga final disepakati via WhatsApp.</p>
        </div>
      </div>
    </footer>
    <ChatAssistantLazy whatsappNumber={whatsappNumber} />
    </>
  );
}
