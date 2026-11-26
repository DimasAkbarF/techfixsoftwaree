import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedServices,
  getPublishedTestimonials,
} from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { HeroBackground } from "@/components/public/hero-background";
import { ParallaxHero } from "@/components/public/parallax-hero";
import { PublicFooter } from "@/components/public/public-footer";
import { RomMarquee } from "@/components/public/rom-marquee";
import { ConsultationForm } from "@/components/public/consultation-form";
import { ServiceIcon } from "@/components/common/service-icon";
import { SERVICE_STEPS } from "@/lib/service-flow";
import { leadParagraph, pageSeo } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  IconArrowRight,
  IconDeviceMobile,
  IconMessageCircle,
  IconStarFilled,
  IconUsb,
} from "@tabler/icons-react";

// ISR: halaman publik di-cache 5 menit, admin memanggil revalidatePath/revalidateTag saat konten berubah.
export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Jasa Servis Software Android Remote & Rangkasbitung — TechFixSoftware",
  description:
    "Jasa servis software Android remote seluruh Indonesia & Rangkasbitung: fix bootloop, unbrick, stuck logo, flash firmware, root, custom ROM, unlock bootloader, dan downgrade. Konsultasi WhatsApp, harga disepakati dulu.",
  path: "/",
});

const PREPARATION = [
  { icon: IconDeviceMobile, title: "Device", body: "Perangkat Android yang bermasalah." },
  { icon: IconUsb, title: "Kabel USB", body: "Sesuai konektor device Anda." },
  { icon: IconMessageCircle, title: "Keluhan", body: "Kapan mulai, apa yang berubah sebelumnya." },
];

function formatDate(date: Date | string | null) {
  if (!date) return "Baru saja";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function Home() {
  const [allServices, allTestimonials, allArticles, setting] = await Promise.all([
    getPublishedServices(),
    getPublishedTestimonials(),
    getPublishedArticles(),
    getPublicSiteSetting(),
  ]);

  const services = allServices.slice(0, 5);
  const testimonials = allTestimonials.slice(0, 2);
  const articles = allArticles.slice(0, 3);

  const priceLabel = setting?.minPriceLabel || "mulai dari Rp50.000";
  const whatsappConfigured = Boolean(setting?.whatsappNumber?.trim());

  const homeFaqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Apa itu TechFixSoftware dan layanan apa yang disediakan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TechFixSoftware adalah spesialis servis software Android profesional yang melayani perbaikan secara remote jarak jauh ke seluruh Indonesia dan tatap muka di Rangkasbitung. Layanan meliputi perbaikan bootloop, hardbrick/unbrick (EDL/Fastboot), stuck logo, flashing firmware resmi, root Magisk/KernelSU, install custom ROM, unlock bootloader (UBL), bypass FRP, dan downgrade Android.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana cara kerja servis software Android jarak jauh (remote)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Klien cukup menyediakan PC/Laptop Windows dan kabel data USB. Teknisi TechFixSoftware akan menghubungkan sistem melalui aplikasi remote seperti UltraViewer, AnyDesk, atau TeamViewer untuk melakukan diagnosa dan eksekusi flashing langsung di komputer klien.",
        },
      },
      {
        "@type": "Question",
        name: "Berapa biaya servis software Android di TechFixSoftware?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Biaya servis mulai dari Rp50.000 tergantung tingkat kerusakan dan tipe perangkat. Biaya final disepakati di muka via konsultasi WhatsApp sebelum pengerjaan dimulai, tanpa biaya tersembunyi.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah servis software Android secara remote aman?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sangat aman. Klien dapat memantau setiap langkah yang dilakukan teknisi secara langsung di layar komputer mereka secara real-time.",
        },
      },
      {
        "@type": "Question",
        name: "Merek HP Android apa saja yang bisa diperbaiki di TechFixSoftware?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hampir semua merek Android dapat ditangani, termasuk Xiaomi, Redmi, Poco, Samsung, Realme, Oppo, Vivo, Asus ROG/Zenfone, Infinix, Tecno, Google Pixel, OnePlus, dan Motorola.",
        },
      },
    ],
  };

  return (
    <div className="page-canvas-hero min-h-screen">
      <JsonLd data={homeFaqLd} />
      <PublicHeader active="beranda" overlay />

      <main id="main">
        {/* Hero sticky dengan efek paralaks; konten di bawahnya meluncur naik menutupi hero. */}
        <ParallaxHero>
          <HeroBackground />
          <div className="parallax-hero__content relative z-[2] mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-4 pb-24 pt-28 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:pb-24 lg:pt-[calc(118*var(--u))]">
            <div className="lg:col-span-7">
              <p className="font-medium uppercase tracking-[0.045em] text-[#34d399] text-[13px] lg:text-[clamp(13px,calc(14.5*var(--u)),16px)]">
                Jasa Servis Software Android &middot; Konsultasi &amp; Estimasi Transparan
              </p>
              <h1 className="mt-4 font-heading text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[3.5rem] lg:text-[clamp(2.75rem,calc(65*var(--u)),4.25rem)] lg:leading-[0.97]">
                <span className="bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_45%,#c3c6cc_100%)] bg-clip-text text-transparent">
                  Servis software{" "}
                </span>
                <span className="bg-[linear-gradient(90deg,#a7f3d0_0%,#34d399_50%,#0d9488_100%)] bg-clip-text text-transparent">
                  Android,
                </span>
                <span className="bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_45%,#c3c6cc_100%)] bg-clip-text text-transparent">
                  {" "}
                  tanpa perlu ke toko.
                </span>
              </h1>
              <p className="hero-reveal hero-reveal-2 mt-6 max-w-xl text-base leading-[1.55] text-[#aeb4bd] lg:text-[clamp(1rem,calc(19.5*var(--u)),1.25rem)] lg:leading-[1.51]">
                Bootloop, brick, stuck logo, flashing firmware, root, dan downgrade. Konsultasi
                dulu{" "}
                <span className="text-[#e9ecf0]">
                  lewat WhatsApp; harga disepakati sebelum device
                </span>{" "}
                diserahkan.
              </p>

              <div className="hero-reveal hero-reveal-3 mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <a
                  href="#konsultasi"
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-[image:var(--cta-gradient)] px-6 text-[15px] font-bold text-[#041a14] shadow-[0_8px_28px_rgba(16,185,129,0.30)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090F]"
                >
                  Konsultasi sekarang
                  <IconArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/services"
                  className="inline-flex h-[52px] items-center justify-center rounded-[14px] border-[1.5px] border-white/85 bg-transparent px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Lihat katalog layanan
                </Link>
              </div>
            </div>

            <aside className="hero-reveal hero-reveal-2 lg:col-span-5 lg:self-center">
              <dl
                className="rounded-[16px] border border-white/40 p-7"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(120,128,142,0.2))",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <div className="border-l-[3px] border-[#34d399] pl-4">
                  <dt className="text-[13px] font-medium uppercase tracking-[0.13em] text-[#cfd5de]">
                    Biaya servis
                  </dt>
                  <dd className="mt-2 font-heading text-xl font-semibold text-white">
                    {priceLabel}
                  </dd>
                </div>
                <div className="mt-6 border-t border-white/20 pt-6">
                  <dt className="border-l-[3px] border-[#34d399] pl-4 text-[13px] font-medium uppercase tracking-[0.13em] text-[#cfd5de]">
                    Tanpa toko fisik
                  </dt>
                  <dd className="border-l-[3px] border-[#34d399] pl-4 pt-2 text-sm leading-relaxed text-[#e9ecf0]">
                    Device tidak perlu dikirim sebelum harga dan cara pengerjaan disepakati.
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </ParallaxHero>

        <div className="parallax-sheet">
          <RomMarquee />

        {/* Layanan unggulan: baris bergaris, bukan grid kartu (DESIGN.md §6, §8) */}
        {services.length > 0 && (
          <section>
            <div className="mx-auto max-w-[1200px] px-4 py-14 lg:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-primary)]">
                    Layanan yang ditangani
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
                    Harga di bawah adalah penanda awal. Nominal final ditetapkan setelah kendala
                    dipahami.
                  </p>
                </div>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary)] hover:underline"
                >
                  Semua layanan
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="group grid grid-cols-1 gap-3 py-5 transition-colors hover:bg-[#0B1220]/[0.035] md:grid-cols-[1fr_auto] md:items-center md:gap-8"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-[var(--color-border)] bg-[#fbfdfc]/65">
                        <ServiceIcon
                          name={service.icon}
                          className="h-5 w-5 text-[var(--color-accent)]"
                        />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-base font-bold text-[var(--color-primary)] group-hover:underline">
                            {service.name}
                          </h3>
                          <span className="text-xs text-[var(--color-muted)]">
                            {service.category}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
                          {leadParagraph(service.description)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-6 pl-14 md:justify-end md:pl-0">
                      <span className="font-mono text-sm font-semibold text-[var(--color-primary)]">
                        {service.priceFromLabel}
                      </span>
                      <IconArrowRight className="h-4 w-4 text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Alur layanan: rail 4 kolom bergaris atas, bukan kartu. */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-primary)]">
                Alur layanan
              </h2>
              <Link
                href="/cara-kerja"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary)] hover:underline"
              >
                Lihat cara kerja layanan
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ol className="grid grid-cols-1 gap-8 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICE_STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-heading text-sm font-semibold text-[var(--color-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                    {step.summary}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Persiapan pelanggan (DEC-001) */}
        <section>
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-4 py-12 md:grid-cols-12 lg:px-8">
            <div className="md:col-span-4">
              <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-primary)]">
                Sebelum konsultasi
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                Tidak perlu keahlian teknis. Tiga hal ini cukup untuk memulai.
              </p>
            </div>
            <ul className="grid gap-6 md:col-span-8 sm:grid-cols-3">
              {PREPARATION.map((item) => (
                <li key={item.title} className="border-l-2 border-[var(--color-border)] pl-4">
                  <item.icon className="h-5 w-5 text-[var(--color-accent)]" />
                  <h3 className="mt-3 font-heading text-sm font-semibold text-[var(--color-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Testimoni terpilih: kutipan bergaris kiri, bukan kartu (DESIGN.md §8) */}
        {testimonials.length > 0 && (
          <section>
            <div className="mx-auto max-w-[1200px] px-4 py-14 lg:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-primary)]">
                  Kata pelanggan
                </h2>
                <Link
                  href="/testimonials"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary)] hover:underline"
                >
                  Semua testimoni
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {testimonials.map((testimonial) => (
                  <blockquote
                    key={testimonial.id}
                    className="border-l-2 border-[var(--color-border)] py-1 pl-5"
                  >
                    {testimonial.imageUrl ? (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Dokumentasi servis
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-[var(--color-warning)]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <IconStarFilled
                              key={star}
                              className={
                                star <= testimonial.rating
                                  ? "h-3.5 w-3.5"
                                  : "h-3.5 w-3.5 text-[var(--color-border)]"
                              }
                            />
                          ))}
                        </span>
                        <span className="text-xs font-semibold text-[var(--color-primary)]">
                          {testimonial.rating} dari 5
                        </span>
                      </div>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg)]">
                      {testimonial.imageUrl
                        ? testimonial.review
                        : `\u201c${testimonial.review}\u201d`}
                    </p>
                    <footer className="mt-3 text-xs text-[var(--color-muted)]">
                      <span className="font-semibold text-[var(--color-primary)]">
                        {testimonial.customerName}
                      </span>
                      <span aria-hidden="true"> &middot; </span>
                      {testimonial.deviceType}
                      {testimonial.imageUrl && (
                        <>
                          <span aria-hidden="true"> &middot; </span>
                          <Link
                            href="/testimonials"
                            className="font-semibold text-[var(--color-secondary)] hover:underline"
                          >
                            Lihat bukti
                          </Link>
                        </>
                      )}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Artikel terbaru: daftar editorial */}
        {articles.length > 0 && (
          <section>
            <div className="mx-auto max-w-[1200px] px-4 py-14 lg:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-primary)]">
                  Catatan servis
                </h2>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary)] hover:underline"
                >
                  Semua artikel
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <h3 className="font-heading text-base font-semibold text-[var(--color-primary)] group-hover:underline">
                      {article.title}
                    </h3>
                    <span className="shrink-0 font-mono text-xs text-[var(--color-muted)]">
                      {formatDate(article.publishedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Form konsultasi (DEC-003) */}
        <section
          id="konsultasi"
          className="scroll-mt-20"
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-14 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-primary)]">
                Mulai dari keluhan Anda
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                Isi empat kolom, termasuk nomor WhatsApp agar admin bisa membalas. Data tersimpan
                sebagai lead, lalu Anda diarahkan ke WhatsApp admin dengan pesan yang sudah terisi.
              </p>
              <p className="mt-4 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-[var(--color-muted)]">
                Tidak ada toko fisik. Setelah form, harga dan waktu pengerjaan disepakati personal
                via WhatsApp.
              </p>
            </div>
            <div className="lg:col-span-7 lg:max-w-xl">
              <ConsultationForm whatsappConfigured={whatsappConfigured} />
            </div>
          </div>
        </section>
        </div>
      </main>

      <div className="relative z-10 bg-[var(--page-bg)]">
        <PublicFooter />
      </div>
    </div>
  );
}
