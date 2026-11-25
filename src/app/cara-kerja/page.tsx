import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { SERVICE_STEPS } from "@/lib/service-flow";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";
import { IconArrowRight } from "@tabler/icons-react";

// ISR: cache 5 menit; admin memanggil revalidatePath saat konten berubah.
export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Cara Kerja Layanan — TechFixSoftware",
  description:
    "Empat langkah servis software Android: konsultasi WhatsApp, kesepakatan harga, perjanjian, lalu penyerahan device.",
  path: "/cara-kerja",
});

const PREPARATION = [
  { title: "Device", body: "Perangkat Android yang bermasalah." },
  { title: "Kabel USB", body: "Sesuai konektor device Anda." },
  { title: "Keluhan", body: "Kapan mulai, apa yang berubah sebelumnya." },
];

export default function CaraKerjaPage() {
  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader />

      <main id="main" className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Cara Kerja", path: "/cara-kerja" },
          ])}
        />
        <div className="max-w-2xl border-b border-[var(--color-border)] pb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-primary)]">
            Cara kerja layanan TechFixSoftware
          </h1>
          <p className="mt-2 text-base leading-relaxed text-[var(--color-muted)]">
            Servis software Android di TechFixSoftware berjalan dalam empat tahap: konsultasi
            keluhan via WhatsApp, kesepakatan harga awal mulai dari Rp50.000, perjanjian waktu dan
            metode, lalu pengerjaan remote (via PC dan kabel USB) atau penyerahan device sesuai
            kesepakatan tanpa toko fisik.
          </p>
          <Link
            href="/services"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary)] hover:underline"
          >
            Layanan servis software Android
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ol className="mt-8 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {SERVICE_STEPS.map((step, index) => (
            <li key={step.title} className="grid gap-4 py-8 md:grid-cols-12">
              <span className="font-mono text-xs text-[var(--color-muted)] md:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="md:col-span-11">
                <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{step.summary}</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                      Yang Anda lakukan
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-fg)]">
                      {step.customer}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                      Yang TechFixSoftware lakukan
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-fg)]">
                      {step.provider}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
            Online atau offline
          </h2>
          <div className="mt-4 grid divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="py-4 md:pr-6">
              <h3 className="font-heading text-sm font-semibold text-[var(--color-primary)]">
                Offline
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                Device dan kabel USB diserahkan sesuai perjanjian. Waktu dan tempat penyerahan
                dibicarakan lewat WhatsApp.
              </p>
            </div>
            <div className="py-4 md:pl-6">
              <h3 className="font-heading text-sm font-semibold text-[var(--color-primary)]">
                Online
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                Pengerjaan jarak jauh dimungkinkan bila perangkat Anda memenuhi syarat. Syaratnya
                dibicarakan saat konsultasi, tergantung jenis kendala.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
            Sebelum mulai
          </h2>
          <ul className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {PREPARATION.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="font-heading text-sm font-semibold text-[var(--color-primary)]">
                  {item.title}
                </span>
                <span className="text-sm text-[var(--color-muted)] sm:text-right">{item.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 border-t border-[var(--color-border)] pt-8">
          <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
            Mulai dari keluhan Anda
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Harga final disepakati via WhatsApp sebelum device diserahkan.
          </p>
          <Link
            href="/#konsultasi"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Konsultasi sekarang
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
