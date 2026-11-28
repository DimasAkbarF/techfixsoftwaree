import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedTestimonials } from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";
import {
  IconStarFilled,
  IconMessageCircle,
  IconDeviceMobile,
  IconShieldCheck,
} from "@tabler/icons-react";

// ISR: cache 5 menit; admin memanggil revalidatePath saat konten berubah.
export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Testimoni — TechFixSoftware",
  description:
    "Bukti dokumentasi keberhasilan pengerjaan dan ulasan pelanggan servis software Android yang ditangani oleh TechFixSoftware.",
  path: "/testimonials",
});

export default async function TestimonialsPublicPage() {
  const testimonials = await getPublishedTestimonials();

  const documented = testimonials.filter((item) => item.imageUrl);
  const quoted = testimonials.filter((item) => !item.imageUrl);

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="testimoni" />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[1200px] px-4 py-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Testimoni & Bukti Servis Pelanggan
          </h1>
          <p className="mt-2 max-w-2xl text-base text-white/75">
            Ulasan dan dokumentasi kasus dari pelanggan yang perangkatnya telah ditangani TechFixSoftware.
            Bukti diambil langsung dari tangkapan layar komunikasi pelanggan.
          </p>
        </div>
      </section>

      <main id="main" className="max-w-[1200px] mx-auto px-4 py-10">
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Testimoni", path: "/testimonials" },
          ])}
        />

        {testimonials.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]/85">
            <h2 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
              Belum ada testimoni yang dipublikasikan
            </h2>
            <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
              Testimoni akan ditambahkan oleh admin setelah perbaikan perangkat diselesaikan.
            </p>
            <Link href="/services">
              <Button variant="outline" size="sm">
                Lihat Katalog Layanan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Bukti servis: screenshot pelanggan, bukan kutipan rekaan. */}
            {documented.length > 0 && (
              <section>
                <div className="mb-5">
                  <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                    Dokumentasi kasus
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Tangkapan layar dari pelanggan setelah perangkat selesai ditangani.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {documented.map((testi) => (
                    <figure
                      key={testi.id}
                      className="flex flex-col rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-3"
                    >
                      <a
                        href={testi.imageUrl!}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[#F9FAFB]"
                      >
                        {testi.imageUrl!.startsWith("/") ? (
                          <Image
                            src={testi.imageUrl!}
                            alt={`Bukti servis ${testi.deviceType}`}
                            width={720}
                            height={1600}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="aspect-[9/16] w-full object-cover object-top"
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={testi.imageUrl!}
                            alt={`Bukti servis ${testi.deviceType}`}
                            width={720}
                            height={1600}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[9/16] w-full object-cover object-top"
                          />
                        )}
                      </a>
                      <figcaption className="flex flex-1 flex-col gap-1 pt-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                          <IconShieldCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
                          <span>Bukti servis terverifikasi</span>
                        </div>
                        <div className="font-heading text-sm font-bold text-[var(--color-primary)]">
                          {testi.deviceType}
                        </div>
                        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                          {testi.review}
                        </p>
                        <a
                          href={testi.imageUrl!}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-auto inline-block pt-1 text-xs font-semibold text-[var(--color-secondary)] hover:underline"
                        >
                          Buka screenshot
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {/* Kutipan pelanggan (testimoni teks) */}
            {quoted.length > 0 && (
              <section>
                <h2 className="mb-5 font-heading text-xl font-bold text-[var(--color-primary)]">
                  Ulasan pelanggan
                </h2>
                {/* DESIGN.md §8: garis kiri 2px --color-border, bukan kartu membulat berulang. */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {quoted.map((testi) => (
                    <blockquote
                      key={testi.id}
                      className="space-y-3 border-l-2 border-[var(--color-border)] py-2 pl-5"
                    >
                      {/* Rating WCAG 2.1 AA (DESIGN.md §12): Bintang + Teks "X dari 5" */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-[var(--color-warning)]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <IconStarFilled
                              key={star}
                              className={`w-4 h-4 ${
                                star <= testi.rating
                                  ? "text-[var(--color-warning)]"
                                  : "text-[var(--color-border)]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-primary)]">
                          {testi.rating} dari 5
                        </span>
                      </div>

                      <p className="text-sm italic leading-relaxed text-[var(--color-fg)]">
                        &ldquo;{testi.review}&rdquo;
                      </p>

                      <footer className="pt-1">
                        <div className="font-heading text-sm font-bold text-[var(--color-primary)]">
                          {testi.customerName}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                          <IconDeviceMobile className="w-3.5 h-3.5" />
                          <span>{testi.deviceType}</span>
                        </div>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Bottom Consultation CTA */}
        <div className="mt-16 p-8 border border-[var(--color-border)] bg-[var(--color-surface)]/85 rounded-[var(--radius)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
              Device Anda Mengalami Masalah Serupa?
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Konsultasikan sekarang secara langsung ke WhatsApp admin TechFixSoftware. Harga mulai dari Rp50.000.
            </p>
          </div>
          <Link href="/services">
            <Button variant="primary" className="gap-2 shrink-0">
              <IconMessageCircle className="w-5 h-5" />
              <span>Pilih Layanan & Konsultasi</span>
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
