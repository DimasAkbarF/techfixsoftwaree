import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicSiteSetting } from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ServiceTracker } from "@/components/public/service-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Cek Status Servis — TechFixSoftware",
  description:
    "Pantau progres pengerjaan tiket servis software Android Anda secara real-time dengan kode tiket dan 4 digit terakhir nomor WA.",
  path: "/cek-servis",
});

export default async function CekServisPage() {
  const setting = await getPublicSiteSetting();

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="cek-servis" />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[1000px] px-4 py-10">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#34d399]">
            Transparansi Pengerjaan
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white">
            Cek Status Servis Anda
          </h1>
          <p className="mt-2 max-w-2xl text-base text-white/75">
            Masukkan kode tiket dari teknisi TechFixSoftware beserta 4 digit terakhir nomor WhatsApp untuk melihat progres terkini.
          </p>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-[1000px] px-4 py-10 space-y-10">
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Cek Status Servis", path: "/cek-servis" },
          ])}
        />

        <ServiceTracker whatsappNumber={setting?.whatsappNumber ?? null} />

        <section className="grid gap-6 sm:grid-cols-2 border-t border-[var(--color-border)] pt-8 text-sm">
          <div className="space-y-1.5">
            <h2 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Dari mana mendapatkan Kode Tiket?
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Kode tiket (6 karakter) diberikan otomatis oleh teknisi melalui WhatsApp setelah formulir konsultasi Anda kami terima.
            </p>
          </div>
          <div className="space-y-1.5">
            <h2 className="font-heading text-base font-bold text-[var(--color-primary)]">
              Belum pernah mendaftar konsultasi?
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Gunakan{" "}
              <Link href="/diagnosa" className="font-semibold text-[var(--color-primary)] underline">
                Diagnosa Cepat
              </Link>{" "}
              untuk cek gejala HP Anda atau langsung isi formulir di{" "}
              <Link href="/#konsultasi" className="font-semibold text-[var(--color-primary)] underline">
                halaman Beranda
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
