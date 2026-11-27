import * as React from "react";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import {
  ArticleCatalog,
  type ArticleCatalogItem,
  type ArticleTopic,
} from "@/components/public/article-catalog";
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

function classifyTopic(title: string, slug: string): ArticleTopic {
  const text = `${title} ${slug}`.toLowerCase();
  if (/(root|magisk|kernelsu|ubl|bootloader|play integrity|safetynet)/.test(text)) {
    return "Root & UBL";
  }
  if (/(bootloop|brick|unbrick|edl|9008|mati total|fastboot|stuck)/.test(text)) {
    return "Bootloop & Unbrick";
  }
  if (/(custom rom|twrp|orangefox|recovery|lineage|pixelos|crdroid|evolution)/.test(text)) {
    return "Custom ROM & Recovery";
  }
  return "Firmware & Partisi";
}

export default async function ArticlesPublicPage() {
  const articles = await getPublishedArticles();
  const catalogItems: ArticleCatalogItem[] = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: ringkasan(article.content),
    coverImageUrl: article.coverImageUrl,
    publishedLabel: tanggal(article.publishedAt),
    topic: classifyTopic(article.title, article.slug),
  }));

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="artikel" />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[1200px] px-4 py-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Artikel & Panduan Servis Android
          </h1>
          <p className="mt-2 max-w-2xl text-base text-white/75">
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
          <ArticleCatalog articles={catalogItems} />
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
