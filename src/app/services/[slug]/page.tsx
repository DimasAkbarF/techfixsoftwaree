import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedServiceBySlug,
  getPublishedServices,
} from "@/lib/public-data";
import { pickRelatedArticlesForService } from "@/lib/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, clip, leadParagraph, pageSeo } from "@/lib/seo";
import { parseArticleBlocks } from "@/lib/article-blocks";
import { ContentBlocks } from "@/components/public/content-blocks";
import { SITE_URL } from "@/lib/site";
import { ServiceIcon } from "@/components/common/service-icon";
import { ConsultationForm } from "@/components/public/consultation-form";
import { PublicHeader } from "@/components/public/public-header";
import { HeroBackground } from "@/components/public/hero-background";
import { PublicFooter } from "@/components/public/public-footer";
import {
  IconChevronRight,
  IconAlertTriangle,
  IconUsb,
  IconCheck,
  IconInfoCircle,
  IconArrowRight,
} from "@tabler/icons-react";

// ISR: cache 5 menit; admin memanggil revalidatePath/revalidateTag saat konten berubah.
export const revalidate = 300;

// Slug yang sudah ada di-prerender saat build; slug baru dibuat on-demand lalu di-cache.
export async function generateStaticParams() {
  const services = await getPublishedServices();
  return services.map((service) => ({ slug: service.slug }));
}

// Tanpa ini semua halaman layanan mewarisi title/description root yang sama.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);

  if (!service) return {};

  return pageSeo({
    title: `${service.name} — TechFixSoftware`,
    description: clip(leadParagraph(service.description)),
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [service, siteSetting, allArticles] = await Promise.all([
    getPublishedServiceBySlug(slug),
    getPublicSiteSetting(),
    getPublishedArticles(),
  ]);

  if (!service) {
    notFound();
  }

  const relatedArticles = pickRelatedArticlesForService(service, allArticles, 3);

  const whatsappConfigured = Boolean(
    siteSetting?.whatsappNumber && siteSetting.whatsappNumber.trim().length > 0
  );

  // Harga hanya dinyatakan kalau labelnya memang memuat angka — jangan mengarang.
  const minPrice = service.priceFromLabel.match(/Rp\s?([\d.]+)/)?.[1]?.replace(/\./g, "");
  const serviceUrl = `${SITE_URL}/services/${service.slug}`;

  // Deskripsi berisi paragraf pembuka + bagian detail (heading, bullet, Q&A).
  const descriptionBlocks = parseArticleBlocks(service.description);
  const [leadBlock, ...detailBlocks] = descriptionBlocks;
  const lead = leadBlock?.type === "p" ? leadBlock.text : leadParagraph(service.description);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.category,
    description: leadParagraph(service.description),
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: [{ "@type": "Country", "name": "Indonesia" }],
    url: serviceUrl,
    ...(minPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            availability: "https://schema.org/InStock",
            url: serviceUrl,
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice,
              priceCurrency: "IDR",
            },
          },
        }
      : {}),
  };

  const breadcrumbLd = breadcrumb([
    { name: "Beranda", path: "/" },
    { name: "Katalog Layanan", path: "/services" },
    { name: service.name, path: `/services/${service.slug}` },
  ]);

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="katalog" />

      <section className="hero-shell">
        <HeroBackground />
        <div className="relative z-[2] mx-auto max-w-[1200px] px-4 pb-12 pt-8">
          <nav className="mb-6 flex items-center gap-2 text-xs text-[#D7E0E5]">
            <Link href="/" className="hover:text-white hover:underline">
              Beranda
            </Link>
            <IconChevronRight className="h-3.5 w-3.5 text-white/40" />
            <Link href="/services" className="hover:text-white hover:underline">
              Katalog Layanan
            </Link>
            <IconChevronRight className="h-3.5 w-3.5 text-white/40" />
            <span className="font-medium text-white">{service.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius)] border border-white/20 bg-[#0d1117]/60">
              <ServiceIcon name={service.icon} className="h-7 w-7 text-[#38BDF8]" />
            </div>
            <div>
              <span className="rounded-[var(--radius)] bg-white/10 px-2.5 py-0.5 text-xs font-medium text-[#7DD3FC]">
                {service.category}
              </span>
              <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-white md:text-3xl">
                {service.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main id="main" className="max-w-[1200px] mx-auto px-4 py-8">
        <JsonLd data={serviceLd} />
        <JsonLd data={breadcrumbLd} />

        {/* Split 8 / 4 Layout (DESIGN.md §6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (Col 8/12) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border-b border-[var(--color-border)] pb-6">
              <p className="text-base text-[var(--color-muted)] leading-relaxed mt-4">
                {lead}
              </p>

              {/* Ringkasan fakta terstruktur untuk pembaca, Google, dan Answer Engine */}
              <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-[var(--color-border)] pt-4 text-xs sm:grid-cols-3">
                <div>
                  <dt className="uppercase tracking-wider text-[var(--color-muted)]">Biaya awal</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-[var(--color-primary)]">
                    {service.priceFromLabel}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-[var(--color-muted)]">Metode servis</dt>
                  <dd className="mt-1 font-medium text-[var(--color-fg)]">
                    Remote / perjanjian tanpa toko fisik
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-[var(--color-muted)]">Persetujuan harga</dt>
                  <dd className="mt-1 font-medium text-[var(--color-fg)]">
                    Disepakati via WhatsApp sebelum proses
                  </dd>
                </div>
              </dl>
            </div>

            {/* Gejala Kerusakan */}
            {service.symptoms && service.symptoms.length > 0 && (
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-6 rounded-[var(--radius)] space-y-3">
                <div className="flex items-center gap-2 text-[var(--color-primary)] font-heading text-base font-semibold">
                  <IconAlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
                  <h2>Gejala Kerusakan yang Ditangani</h2>
                </div>
                <ul className="space-y-2.5 pt-2">
                  {service.symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--color-fg)]">
                      <IconCheck className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Persiapan Pelanggan (DEC-001) */}
            {service.preparation && service.preparation.length > 0 && (
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-6 rounded-[var(--radius)] space-y-3">
                <div className="flex items-center gap-2 text-[var(--color-primary)] font-heading text-base font-semibold">
                  <IconUsb className="w-5 h-5 text-[var(--color-accent)]" />
                  <h2>Persiapan Pelanggan (Sebelum Konsultasi / Servis)</h2>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Untuk servis offline rumahan atau remote, pastikan Anda menyiapkan kelengkapan berikut:
                </p>
                <ul className="space-y-2.5 pt-2">
                  {service.preparation.map((prep, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--color-fg)] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0 mt-2" />
                      <span>{prep}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detail layanan dari konten panjang di DB (heading, bullet, Q&A) */}
            {detailBlocks.length > 0 && (
              <section className="border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-6 rounded-[var(--radius)]">
                <ContentBlocks blocks={detailBlocks} />
              </section>
            )}

            {/* Aturan Alur & Informasi Rumahan (DEC-002) */}
            <section className="border border-[var(--color-border)] bg-[var(--color-surface)]/75 p-5 rounded-[var(--radius)] text-xs text-[var(--color-muted)] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[var(--color-primary)] text-sm">
                <IconInfoCircle className="w-4 h-4 text-[var(--color-accent)]" />
                <h2 className="font-heading text-sm font-semibold text-[var(--color-primary)]">
                  Alur Servis TechFixSoftware (Rumahan &amp; Perjanjian WhatsApp)
                </h2>
              </div>
              <p className="leading-relaxed">
                TechFixSoftware tidak memiliki toko fisik. Setelah Anda mengirimkan form konsultasi di samping,
                Anda akan langsung diarahkan ke chat WhatsApp resmi admin untuk negosiasi kesepakatan harga
                dan pembuatan janji temu.{" "}
                <Link href="/cara-kerja" className="font-semibold text-[var(--color-secondary)] hover:underline">
                  Lihat cara kerja layanan lengkap
                </Link>
                .
              </p>
            </section>

            {/* Tautan internal ke panduan relevan (SEO H5 & topical cluster) */}
            {relatedArticles.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-base font-bold text-[var(--color-primary)]">
                    Panduan &amp; Artikel Terkait
                  </h2>
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-secondary)] hover:underline"
                  >
                    Semua artikel
                    <IconArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                  {relatedArticles.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="group flex items-center justify-between gap-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
                      >
                        <span>{article.title}</span>
                        <IconArrowRight className="w-4 h-4 shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sticky Consultation Panel (Col 4/12) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-4 rounded-[var(--radius)] flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">
                  Estimasi Biaya
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-primary)]">
                  {service.priceFromLabel}
                </div>
              </div>
              <span className="text-[11px] text-[var(--color-muted)] text-right max-w-[130px] leading-tight">
                *Harga pasti disepakati di WhatsApp
              </span>
            </div>

            <ConsultationForm
              serviceId={service.id}
              serviceName={service.name}
              whatsappConfigured={whatsappConfigured}
              headingAs="h2"
            />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
