import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";
import { SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";
import {
  IconArrowRight,
  IconBrandAndroid,
  IconDeviceDesktop,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react";

export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: `Tentang ${SITE_NAME} — Layanan Servis Software Android`,
  description:
    "Profil TechFixSoftware dan Dimas Akbar: servis software Android remote seluruh Indonesia serta tatap muka di Rangkasbitung dan Jabodetabek (menyesuaikan lokasi + tambahan biaya ongkir).",
  path: "/tentang",
});

const PRINCIPLES = [
  {
    icon: IconDeviceDesktop,
    title: "Remote Transparan Real-Time",
    body: "Setiap sesi remote (AnyDesk, UltraViewer, atau TeamViewer) berjalan langsung di layar komputer Anda sehingga seluruh tahapan bisa dipantau penuh.",
  },
  {
    icon: IconShieldCheck,
    title: "Protokol Cadangan & Kejujuran Risiko",
    body: "Sebelum eksekusi root atau flashing, teknisi mencadangkan partisi boot asli bila memungkinkan dan menjelaskan risiko data atau kompatibilitas aplikasi secara terbuka.",
  },
  {
    icon: IconBrandAndroid,
    title: "Fokus Khusus Software Android",
    body: "Kami menangani bootloop, unbrick EDL 9008/BROM, flashing firmware resmi, root Magisk/KernelSU/APatch, custom ROM, unlock bootloader, dan downgrade — bukan ganti sparepart hardware.",
  },
  {
    icon: IconUserCheck,
    title: "Harga Disepakati Sebelum Proses",
    body: "Biaya awal mulai dari Rp50.000. Nominal final selalu dikonfirmasi via WhatsApp sebelum pengerjaan dimulai, tanpa biaya tersembunyi.",
  },
];

export default function TentangPage() {
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `Tentang ${SITE_NAME}`,
    url: `${SITE_URL}/tentang`,
    mainEntity: { "@id": `${SITE_URL}/#business` },
    author: { "@id": `${SITE_URL}/#author` },
  };

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#34d399]">
              Profil &amp; Standar Kerja
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white">
              Tentang {SITE_NAME}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-white/75">
              TechFixSoftware adalah layanan servis software Android jarak jauh (remote) ke seluruh
              Indonesia. Untuk layanan tatap muka (offline), lokasi dapat menyesuaikan untuk area
              Rangkasbitung dan Jabodetabek dengan tambahan biaya ongkir sesuai kesepakatan, tanpa
              toko fisik.
            </p>
          </div>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-[1200px] space-y-12 px-4 py-10 lg:px-8">
        <JsonLd data={aboutLd} />
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Tentang", path: "/tentang" },
          ])}
        />

        {/* Entitas Teknisi / Penulis */}
        <section className="grid gap-6 border-y border-[var(--color-border)] py-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">
              Teknisi &amp; Peninjau Teknis
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-[var(--color-primary)]">
              {SITE_AUTHOR.name}
            </h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-[var(--color-fg)] md:col-span-8">
            <p>{SITE_AUTHOR.bio}</p>
            <p className="text-[var(--color-muted)]">
              Seluruh panduan teknis di situs ini ditulis dan ditinjau langsung berdasarkan kasus
              penanganan software Android harian — meliputi perangkat Qualcomm Snapdragon (Fastboot,
              EDL 9008), MediaTek (BROM/Preloader), Samsung (Odin), dan Google Tensor.
            </p>
          </div>
        </section>

        {/* Prinsip Kerja */}
        <section className="space-y-5">
          <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
            Standar pengerjaan
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <item.icon className="h-5 w-5 text-[var(--color-accent)]" />
                <h3 className="mt-3 font-heading text-base font-bold text-[var(--color-primary)]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cakupan & Tautan */}
        <section className="flex flex-col justify-between gap-6 border-t border-[var(--color-border)] pt-8 md:flex-row md:items-center">
          <div className="max-w-xl space-y-1.5">
            <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
              Perlu bantuan software Android?
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Pelajari alur layanan kami atau langsung konsultasikan tipe HP dan kendala Anda lewat
              WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/#konsultasi"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-[image:var(--cta-gradient)] px-5 text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105"
            >
              Konsultasi sekarang
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[#eaf2ef]"
            >
              Katalog layanan
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
