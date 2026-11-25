import * as React from "react";
import { notFound } from "next/navigation";
import { getAdminArticleById } from "@/app/admin/articles/actions";
import { ArticleForm } from "@/app/admin/articles/article-form";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getAdminArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Edit Artikel: {article.title}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Perbarui isi artikel, cover image, atau status publikasi.
        </p>
      </div>

      <ArticleForm initialData={article} />
    </div>
  );
}
