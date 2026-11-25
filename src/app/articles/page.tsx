import * as React from "react";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { HeroBackground } from "@/components/public/hero-background";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";
import { IconArticle } from "@tabler/icons-react";
import type { Metadata } from "next";

// ISR: cache 5 menit; admin memanggil revalidatePath saat konten berubah.
export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Artikel & Panduan Servis Android — TechFixSoftware",
  description:
    "Panduan teknis seputar bootloop, brick, flashing firmware, root, dan perawatan software perangkat Android.",
  path: "/articles",
});

function tanggal(date: Date | string | null) {
  if (!date) return "Baru saja";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Potong di batas kata; elipsis diserahkan ke line-clamp agar tidak dobel.
function ringkasan(content: string) {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > 140 ? flat.slice(0, 140).replace(/\s+\S*$/, "") : flat;
}

export default async function ArticlesPublicPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="artikel" />

      <section className="hero-shell">
        <HeroBackground />
        <div className="relative z-[2] mx-auto max-w-[1200px] px-4 pb-12 pt-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Artikel & Panduan Servis Android
          </h1>
          <p className="mt-2 max-w-2xl text-base text-[#D7E0E5]">
            Informasi teknis seputar penyebab bootloop, cara penanganan brick, dan edukasi software perangkat Android.
          </p>
        </div>
      </section>

      <main id="main" className="max-w-[1200px] mx-auto px-4 py-10">
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Artikel", path: "/articles" },
          ])}
        />

        {articles.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]/85">
            <IconArticle className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
            <h2 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
              Belum ada artikel yang dipublikasikan
            </h2>
            <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
              Kembali lagi nanti untuk panduan dan artikel terbaru dari tim TechFixSoftware.
            </p>
            <Link href="/services">
              <Button variant="outline" size="sm">
                Lihat Katalog Layanan
              </Button>
            </Link>
          </div>
        ) : (
          /* Grid editorial: 2 kolom di ponsel/tablet, 3 kolom di laptop. Tanpa kartu berbingkai. */
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            {articles.map((article) => (
              <article key={article.id} className="border-t border-[var(--color-border)] pt-4">
                <Link href={`/articles/${article.slug}`} className="group flex flex-col gap-2.5">
                  {article.coverImageUrl && (
                    <div className="mb-1 aspect-[16/9] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[#F9FAFB]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    {tanggal(article.publishedAt)}
                  </span>

                  <h2 className="font-heading text-sm sm:text-base lg:text-lg font-bold leading-snug text-[var(--color-primary)] line-clamp-3 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {article.title}
                  </h2>

                  {/* line-clamp butuh display -webkit-box; sembunyikan lewat wrapper agar clamp tidak batal. */}
                  <div className="hidden sm:block">
                    <p className="text-sm leading-relaxed text-[var(--color-muted)] line-clamp-2">
                      {ringkasan(article.content)}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
