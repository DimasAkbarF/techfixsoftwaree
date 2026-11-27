import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedArticleBySlug,
  getPublishedArticles,
  getPublishedServices,
} from "@/lib/public-data";
import { parseArticleBlocks } from "@/lib/article-blocks";
import { pickRelatedArticles, pickRelatedServicesForArticle } from "@/lib/related-content";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ArticleShare } from "@/components/public/article-share";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, clip, pageSeo, SITE_NAME } from "@/lib/seo";
import { SITE_AUTHOR, SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import {
  IconArrowRight,
  IconChevronRight,
  IconCalendar,
  IconClock,
  IconMessageCircle,
  IconUser,
} from "@tabler/icons-react";

// ISR: cache 5 menit; admin memanggil revalidatePath/revalidateTag saat konten berubah.
export const revalidate = 300;

// Slug yang sudah ada di-prerender saat build; artikel baru dibuat on-demand lalu di-cache.
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) return {};

  const title = article.metaTitle || `${article.title} — TechFixSoftware`;
  const description = clip(article.metaDescription || article.title);
  const path = `/articles/${article.slug}`;

  return {
    ...pageSeo({ title, description, path }),
    openGraph: {
      type: "article",
      locale: "id_ID",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      modifiedTime: new Date(article.updatedAt).toISOString(),
    },
  };
}

function formatTanggal(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [article, allArticles, allServices] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getPublishedArticles(),
    getPublishedServices(),
  ]);

  if (!article) {
    notFound();
  }

  const blocks = parseArticleBlocks(article.content);
  const readingMinutes = estimateReadingMinutes(article.content);
  const seenIds = new Map<string, number>();
  const h2IdByBlockIndex = new Map<number, string>();
  const tocItems: Array<{ id: string; text: string }> = [];

  blocks.forEach((block, index) => {
    if (block.type !== "h2") return;
    const base = slugifyHeading(block.text) || `bagian-${index + 1}`;
    const count = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    h2IdByBlockIndex.set(index, id);
    tocItems.push({ id, text: block.text });
  });

  const relatedServices = pickRelatedServicesForArticle(article, allServices, 2);
  const relatedArticles = pickRelatedArticles(article, allArticles, 3);

  const publishedTime = article.publishedAt ? new Date(article.publishedAt) : null;
  const modifiedTime = new Date(article.updatedAt);
  const showUpdated =
    Boolean(publishedTime) &&
    modifiedTime.getTime() - publishedTime!.getTime() > 24 * 60 * 60 * 1000;

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.metaTitle || article.title,
    description: clip(article.metaDescription || article.title),
    dateModified: modifiedTime.toISOString(),
    inLanguage: "id-ID",
    author: { "@id": `${SITE_URL}/#author` },
    publisher: { "@id": `${SITE_URL}/#business` },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    image: article.coverImageUrl || `${SITE_URL}/brand/techfix-software.png`,
    url: articleUrl,
    ...(publishedTime ? { datePublished: publishedTime.toISOString() } : {}),
  };

  const breadcrumbLd = breadcrumb([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/articles" },
    { name: article.title, path: `/articles/${article.slug}` },
  ]);

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="artikel" />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[800px] px-4 py-8">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/65">
            <Link href="/" className="hover:text-white hover:underline">
              Beranda
            </Link>
            <IconChevronRight className="h-3.5 w-3.5 text-white/40" />
            <Link href="/articles" className="hover:text-white hover:underline">
              Artikel
            </Link>
            <IconChevronRight className="h-3.5 w-3.5 text-white/40" />
            <span className="max-w-[200px] truncate font-medium text-white sm:max-w-none">
              {article.title}
            </span>
          </nav>

          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-white/70">
              <span className="inline-flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-[#34d399]" />
                {publishedTime ? (
                  <time dateTime={publishedTime.toISOString()}>
                    {formatTanggal(publishedTime)}
                  </time>
                ) : (
                  <span>Draft</span>
                )}
              </span>
              {showUpdated && (
                <span>
                  Diperbarui{" "}
                  <time dateTime={modifiedTime.toISOString()}>{formatTanggal(modifiedTime)}</time>
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <IconClock className="h-4 w-4 text-[#34d399]" />
                {readingMinutes} menit baca
              </span>
              <span className="inline-flex items-center gap-2">
                <IconUser className="h-4 w-4 text-[#34d399]" />
                Ditulis &amp; Ditinjau oleh: {SITE_AUTHOR.name} — {SITE_AUTHOR.role}
              </span>
            </div>
            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {article.title}
            </h1>
          </header>
        </div>
      </section>

      <main id="main" className="max-w-[800px] mx-auto px-4 py-10">
        <JsonLd data={articleLd} />
        <JsonLd data={breadcrumbLd} />

        <article className="space-y-6">

          {/* Cover Image */}
          {article.coverImageUrl && (
            <div className="w-full h-64 sm:h-96 rounded-[var(--radius)] overflow-hidden border border-[var(--color-border)] bg-[#F9FAFB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImageUrl}
                alt={article.title}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Daftar Isi otomatis untuk artikel dengan >= 2 subjudul H2 */}
          {tocItems.length >= 2 && (
            <nav
              aria-label="Daftar isi artikel"
              className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-5"
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                Daftar Isi
              </p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {tocItems.map((item, idx) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="inline-flex items-baseline gap-2 text-[var(--color-primary)] hover:text-[var(--color-accent)] hover:underline"
                    >
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Konten Artikel Terstruktur (H2 / H3 / UL / P untuk Google & Answer Engine) */}
          <div className="space-y-4 font-sans text-base leading-relaxed text-[var(--color-fg)]">
            {blocks.map((block, index) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={index}
                    id={h2IdByBlockIndex.get(index)}
                    className="scroll-mt-24 pt-4 font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-primary)]"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "h3") {
                return (
                  <h3
                    key={index}
                    className="pt-2 font-heading text-base sm:text-lg font-semibold text-[var(--color-primary)]"
                  >
                    {block.text}
                  </h3>
                );
              }
              if (block.type === "ul") {
                return (
                  <ul key={index} className="list-disc space-y-2 pl-5 text-[var(--color-fg)]">
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{block.text}</p>;
            })}
          </div>

          {/* Tombol Bagikan Artikel */}
          <ArticleShare title={article.title} url={articleUrl} />

          {/* Tautan Layanan Terkait & Consultation CTA */}
          <section className="mt-12 p-6 border border-[var(--color-border)] bg-[var(--color-surface)]/85 rounded-[var(--radius)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-bold text-[var(--color-primary)]">
                  Mengalami Masalah Serupa pada Device Anda?
                </h2>
                <p className="text-xs text-[var(--color-muted)]">
                  Konsultasikan kendala Android Anda langsung via WhatsApp. Harga mulai dari Rp50.000.
                </p>
              </div>
              <Link href={relatedServices[0] ? `/services/${relatedServices[0].slug}` : "/services"}>
                <Button variant="primary" size="sm" className="gap-2 shrink-0">
                  <IconMessageCircle className="w-4 h-4" />
                  <span>
                    {relatedServices[0]
                      ? `Konsultasi ${relatedServices[0].name}`
                      : "Konsultasi Sekarang"}
                  </span>
                </Button>
              </Link>
            </div>
            {relatedServices.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-3 text-xs">
                <span className="font-semibold text-[var(--color-muted)]">Layanan terkait:</span>
                {relatedServices.map((svc) => (
                  <Link
                    key={svc.id}
                    href={`/services/${svc.slug}`}
                    className="font-semibold text-[var(--color-secondary)] hover:underline"
                  >
                    {svc.name}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Artikel Terkait */}
          {relatedArticles.length > 0 && (
            <section className="pt-4 space-y-3">
              <h2 className="font-heading text-lg font-bold text-[var(--color-primary)]">
                Artikel Terkait
              </h2>
              <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {relatedArticles.map((related) => (
                  <li key={related.id}>
                    <Link
                      href={`/articles/${related.slug}`}
                      className="group flex items-center justify-between gap-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      <span>{related.title}</span>
                      <IconArrowRight className="w-4 h-4 shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
