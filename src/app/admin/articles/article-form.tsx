"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createArticleAction, updateArticleAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  IconDeviceFloppy,
  IconLoader2,
  IconArrowLeft,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";

interface ArticleInitialData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: ContentStatus;
}

function ArticlePreview({
  title,
  content,
  coverImageUrl,
}: {
  title: string;
  content: string;
  coverImageUrl: string | null;
}) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-[var(--radius)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Pratinjau
        </span>
        <span className="font-mono text-[11px] text-[var(--color-muted)]">{words} kata</span>
      </div>

      <div className="max-h-[62vh] overflow-y-auto px-4 py-4">
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt=""
            className="mb-3 aspect-[16/9] w-full rounded-[var(--radius)] border border-[var(--color-border)] object-cover"
          />
        )}
        <h3 className="font-heading text-lg font-bold leading-snug text-[var(--color-primary)]">
          {title.trim() || "Judul artikel"}
        </h3>
        <div className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-fg)]">
          {content.trim() ? (
            content
          ) : (
            <span className="text-[var(--color-muted)]">
              Isi artikel akan tampil di sini saat Anda menulis.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ArticleForm({
  initialData,
}: {
  initialData?: ArticleInitialData;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [coverImageUrl, setCoverImageUrl] = React.useState<string | null>(
    initialData?.coverImageUrl || null
  );
  const [content, setContent] = React.useState(initialData?.content || "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && !initialData) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("slug", slug);
    if (coverImageUrl) {
      formData.set("coverImageUrl", coverImageUrl);
    } else {
      formData.delete("coverImageUrl");
    }

    const result = isEditing
      ? await updateArticleAction(initialData!.id!, formData)
      : await createArticleAction(formData);

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error?.message || "Gagal menyimpan artikel.");
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Artikel</span>
        </Link>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <IconLoader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="w-4 h-4" />
              {isEditing ? "Perbarui Artikel" : "Simpan Artikel"}
            </>
          )}
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="danger">
          <IconAlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-6">

      {/* Detail Utama */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Judul & URL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Artikel *</Label>
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="Contoh: Cara Mengatasi HP Xiaomi Bootloop Setelah Update"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug URL *</Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="contoh: cara-mengatasi-hp-xiaomi-bootloop"
            />
            <p className="text-xs text-[var(--color-muted)]">
              URL artikel di `/articles/{slug}`. Wajib unik.
            </p>
          </div>
        </div>

        {/* Cover Image Upload (TASK-10) */}
        <div className="space-y-1.5 pt-2">
          <Label>Cover Image Artikel (UploadThing)</Label>
          <ImageUpload
            value={coverImageUrl}
            onChange={(url) => setCoverImageUrl(url)}
            label="Unggah Cover Artikel"
            helperText="Unggah gambar cover berformat PNG, JPG, atau WEBP."
          />
        </div>
      </div>

      {/* Konten Artikel */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Konten Artikel
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="content">Isi Konten (Format Teks/Markdown) *</Label>
          <Textarea
            id="content"
            name="content"
            required
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis artikel edukasi, penyebab kerusakan, dan panduan teknis di sini..."
            className="font-mono text-xs leading-relaxed"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Mendukung teks terstruktur, paragraf, dan instruksi langkah demi langkah.
          </p>
        </div>
      </div>

        {/* Pratinjau: collapsible di ponsel/tablet, menempel di kanan saat lebar */}
        <details className="xl:hidden">
          <summary className="cursor-pointer rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
            Pratinjau artikel
          </summary>
          <div className="mt-3">
            <ArticlePreview title={title} content={content} coverImageUrl={coverImageUrl} />
          </div>
        </details>

      {/* Meta SEO & Publikasi */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Status Publikasi & SEO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status Artikel</Label>
            <select
              id="status"
              name="status"
              defaultValue={initialData?.status || "DRAFT"}
              className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <option value="DRAFT">Draft (Tidak Tampil di Publik)</option>
              <option value="PUBLISHED">Published (Terbit di Publik)</option>
            </select>
            <p className="text-xs text-[var(--color-muted)]">
              Artikel `PUBLISHED` otomatis mencatat tanggal publikasi.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={initialData?.metaTitle || ""}
              placeholder="Judul untuk mesin pencari (opsional)"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            defaultValue={initialData?.metaDescription || ""}
            placeholder="Ringkasan singkat artikel untuk snippet Google (opsional)"
          />
        </div>
      </div>

        </div>

        <aside className="hidden xl:sticky xl:top-6 xl:block">
          <ArticlePreview title={title} content={content} coverImageUrl={coverImageUrl} />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Mengikuti format halaman artikel publik.
          </p>
        </aside>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/articles">
          <Button variant="outline" type="button">
            Batal
          </Button>
        </Link>
        <Button variant="secondary" type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <IconLoader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="w-4 h-4" />
              {isEditing ? "Perbarui Artikel" : "Simpan Artikel"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
