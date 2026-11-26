"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconRefresh, IconHome } from "@tabler/icons-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4 py-16 text-[var(--color-fg)]">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-[var(--color-border)] bg-white p-7 shadow-xs">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-danger)]">
          Gangguan Sementara
        </p>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Halaman gagal dimuat.
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          Terjadi kendala koneksi sementara pada server. Silakan muat ulang halaman ini atau kembali
          ke beranda TechFixSoftware.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[image:var(--cta-gradient)] px-5 text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            <IconRefresh className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[#eaf2ef]"
          >
            <IconHome className="h-4 w-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
