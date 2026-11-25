import * as React from "react";
import { ArticleForm } from "@/app/admin/articles/article-form";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Tulis Artikel Baru
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Buat panduan perbaikan software Android baru dan unggah cover image.
        </p>
      </div>

      <ArticleForm />
    </div>
  );
}
