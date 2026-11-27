import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND_PROFILES, getBrandProfile } from "@/lib/brands";
import {
  getPublishedArticles,
  getPublishedServices,
  getPublicSiteSetting,
} from "@/lib/public-data";
import { isValidWhatsappNumber } from "@/lib/phone";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ConsultationForm } from "@/components/public/consultation-form";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconDeviceMobile,
  IconStethoscope,
} from "@tabler/icons-react";

export const revalidate = 300;

export function generateStaticParams() {
  return BRAND_PROFILES.map((brand) => ({ brand: brand.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const profile = getBrandProfile(slug);
  if (!profile) return {};

  return pageSeo({
    title: profile.metaTitle,
    description: profile.metaDescription,
    path: `/merek/${profile.slug}`,
  });
}

export default async function BrandSeoPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const profile = getBrandProfile(slug);
  if (!profile) {
    notFound();
  }

  const [services, articles, setting] = await Promise.all([
    getPublishedServices(),
    getPublishedArticles(),
    getPublicSiteSetting(),
  ]);

  const hasWhatsapp = Boolean(
    setting?.whatsappNumber && isValidWhatsappNumber(setting.whatsappNumber)
  );

  // Pilih layanan dan artikel paling relevan berdasarkan kata kunci merek.
  const matchedServices = services
    .map((svc) => {
      const hay = `${svc.name} ${svc.category} ${svc.description}`.toLowerCase();
      const score = profile.keywords.reduce(
        (acc, kw) => (hay.includes(kw) ? acc + 1 : acc),
        0
      );
      return { svc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.svc);

  const matchedArticles = articles
    .map((art) => {
      const hay = `${art.title} ${art.slug}`.toLowerCase();
      const score = profile.keywords.reduce(
        (acc, kw) => (hay.includes(kw) ? acc + 1 : acc),
        0
      );
      return { art, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.art);

  const otherBrands = BRAND_PROFILES.filter((b) => b.slug !== profile.slug);

  const breadcrumbLd = breadcrumb([
    { name: "Beranda", path: "/" },
    { name: "Layanan", path: "/services" },
    { name: profile.name, path: `/merek/${profile.slug}` },
  ]);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Jasa Servis Software ${profile.name}`,
    description: profile.metaDescription,
    url: `${SITE_URL}/merek/${profile.slug}`,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "Country", name: "Indonesia" },
    serviceType: `Servis Software Android ${profile.name}`,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profile.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="katalog" />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[1100px] px-4 py-10">
          <nav className="mb-4 flex items-center gap-2 text-xs text-white/65">
            <Link href="/" className="hover:text-white hover:underline">
              Beranda
            </Link>
            <IconChevronRight className="h-3.5 w-3.5 text-white/40" />
            <Link href="/services" className="hover:text-white hover:underline">
              Layanan
            </Link>
            <IconChevronRight className="h-3.5 w-3.5 text-white/40" />
            <span className="font-medium text-white">{profile.shortName}</span>
          </nav>

          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#34d399]">
            Spesialis Perangkat Android
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Jasa Servis Software {profile.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/75">
            {profile.heroSubtitle}
          </p>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-[1100px] px-4 py-10 space-y-12">
        <JsonLd data={breadcrumbLd} />
        <JsonLd data={serviceLd} />
        <JsonLd data={faqLd} />

        {/* AEO Answer Block + Model Populer */}
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
              {profile.summaryQuestion}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-fg)]">
              {profile.summaryAnswer}
            </p>

            <div className="space-y-3 pt-2">
              {profile.commonIssues.map((issue) => (
                <div
                  key={issue.title}
                  className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-4"
                >
                  <h3 className="font-heading text-sm font-bold text-[var(--color-primary)]">
                    {issue.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                    {issue.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-5">
            <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5">
              <div className="flex items-center gap-2 font-heading text-sm font-bold text-[var(--color-primary)]">
                <IconDeviceMobile className="h-4 w-4 text-[var(--color-accent)]" />
                <span>Seri {profile.shortName} yang Sering Ditangani</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[var(--color-fg)]">
                {profile.popularModels.map((model) => (
                  <li key={model} className="flex items-start gap-2">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                    <span>{model}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
                Biaya pengerjaan {setting?.minPriceLabel || "mulai dari Rp50.000"}. Harga final selalu disepakati via WhatsApp sebelum tindakan.
              </p>
            </div>

            <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[#071717] p-5 text-white">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#34d399]">
                <IconStethoscope className="h-4 w-4" />
                <span>Bingung Jenis Kerusakannya?</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white/90">
                Cek gejala {profile.shortName} Anda dalam 3 klik untuk mendapatkan rekomendasi layanan &amp; estimasi risiko data.
              </p>
              <Link
                href="/diagnosa"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[#34d399] px-4 py-2 text-xs font-semibold text-[#04231c] transition-colors hover:bg-[#10b981]"
              >
                <span>Buka Diagnosa Cepat</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </section>

        {/* Layanan Relevan */}
        {matchedServices.length > 0 && (
          <section className="space-y-4 border-t border-[var(--color-border)] pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                Layanan yang Cocok untuk {profile.shortName}
              </h2>
              <Link
                href="/services"
                className="text-xs font-semibold text-[var(--color-secondary)] hover:underline"
              >
                Semua Layanan →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {matchedServices.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services/${svc.slug}`}
                  className="group flex flex-col justify-between rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-4 transition-colors hover:border-[var(--color-primary)]/40"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                      {svc.category}
                    </span>
                    <h3 className="mt-1 font-heading text-sm font-bold text-[var(--color-primary)] group-hover:underline">
                      {svc.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-[var(--color-muted)]">
                      {svc.description}
                    </p>
                  </div>
                  <span className="mt-3 text-xs font-semibold text-[var(--color-secondary)]">
                    {svc.priceFromLabel}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Artikel Terkait */}
        {matchedArticles.length > 0 && (
          <section className="space-y-4 border-t border-[var(--color-border)] pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                Panduan &amp; Artikel Terkait
              </h2>
              <Link
                href="/articles"
                className="text-xs font-semibold text-[var(--color-secondary)] hover:underline"
              >
                Semua Artikel →
              </Link>
            </div>
            <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {matchedArticles.map((art) => (
                <li key={art.id}>
                  <Link
                    href={`/articles/${art.slug}`}
                    className="group flex items-center justify-between gap-4 py-3.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    <span>{art.title}</span>
                    <IconArrowRight className="h-4 w-4 shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ Khusus Merek */}
        <section className="space-y-4 border-t border-[var(--color-border)] pt-10">
          <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
            Pertanyaan Umum Servis {profile.shortName}
          </h2>
          <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {profile.faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <h3 className="font-heading text-sm font-bold text-[var(--color-primary)]">
                  {faq.question}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Form Konsultasi Langsung */}
        <section className="border-t border-[var(--color-border)] pt-10">
          <ConsultationForm
            serviceName={`Servis Software ${profile.name}`}
            whatsappConfigured={hasWhatsapp}
            headingAs="h2"
          />
        </section>

        {/* Tautan Internal ke Merek Lain */}
        <section className="border-t border-[var(--color-border)] pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Layanan Merek Android Lainnya
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {otherBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/merek/${b.slug}`}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-3.5 py-1.5 text-xs font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)]/40"
              >
                Servis {b.shortName}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
