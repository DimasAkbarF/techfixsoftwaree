import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { IconArrowRight, IconHome } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="page-canvas flex min-h-screen flex-col">
      <PublicHeader />

      <main
        id="main"
        className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-4 py-20 lg:px-8"
      >
        <div className="max-w-lg space-y-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
            404 &middot; Halaman Tidak Ditemukan
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            Tautan ini tidak tersedia atau sudah dipindahkan.
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Periksa kembali alamat URL yang Anda buka, atau langsung jelajahi katalog layanan
            servis software Android TechFixSoftware.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[image:var(--cta-gradient)] px-5 text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              <IconHome className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[#eaf2ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Lihat Katalog Layanan
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
