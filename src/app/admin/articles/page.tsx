import * as React from "react";
import Link from "next/link";
import { getAdminArticles } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArticleDeleteButton } from "@/components/admin/article-delete-button";
import { IconPlus, IconEdit, IconArticle } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
            Manajemen Artikel
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Tulis panduan servis, artikel edukasi penanganan Android, dan kelola status publikasi.
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button variant="secondary" size="sm" className="gap-2">
            <IconPlus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]">
          <IconArticle className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
          <h3 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
            Belum ada artikel
          </h3>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
            Tulis artikel panduan Android pertama untuk meningkatkan kepercayaan dan edukasi pelanggan.
          </p>
          <Link href="/admin/articles/new">
            <Button variant="secondary" size="sm" className="gap-2">
              <IconPlus className="w-4 h-4" />
              <span>Buat Artikel Pertama</span>
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Judul & Slug</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead>Tanggal Terbit</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="font-medium text-[var(--color-primary)]">
                    {article.title}
                  </div>
                  <div className="text-xs font-mono text-[var(--color-muted)]">
                    /articles/{article.slug}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {article.status === "PUBLISHED" ? (
                    <Badge variant="success">Terbit</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-[var(--color-muted)] font-mono">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Belum terbit"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
                      title="Edit Artikel"
                    >
                      <IconEdit className="w-4 h-4" />
                    </Link>
                    <ArticleDeleteButton id={article.id} title={article.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
