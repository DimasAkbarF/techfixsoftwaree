"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";
import { ADMIN_CACHE_TAGS, getCachedAdminArticles } from "@/lib/admin-data";
import { ContentStatus } from "@prisma/client";

const articleInputSchema = z.object({
  title: z.string().min(3, "Judul artikel minimal 3 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"),
  content: z.string().min(10, "Konten artikel minimal 10 karakter"),
  coverImageUrl: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: z.nativeEnum(ContentStatus).default("DRAFT"),
});

export type ArticleFormData = z.infer<typeof articleInputSchema>;

export async function getAdminArticles() {
  await requireAdminSession();
  return getCachedAdminArticles();
}

export async function getAdminArticleById(id: string) {
  await requireAdminSession();
  try {
    return await prisma.article.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching article by id:", error);
    return null;
  }
}

export async function createArticleAction(formData: FormData) {
  await requireAdminSession();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const content = (formData.get("content") as string)?.trim();
  const coverImageUrlRaw = formData.get("coverImageUrl") as string;
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || null;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || null;
  const status = (formData.get("status") as ContentStatus) || "DRAFT";

  const coverImageUrl =
    coverImageUrlRaw && coverImageUrlRaw.trim().length > 0
      ? coverImageUrlRaw.trim()
      : null;

  const validation = articleInputSchema.safeParse({
    title,
    slug,
    content,
    coverImageUrl,
    metaTitle,
    metaDescription,
    status,
  });

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message || "Input tidak valid",
      },
    };
  }

  // Check unique slug
  const existing = await prisma.article.findUnique({
    where: { slug: validation.data.slug },
  });

  if (existing) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Slug sudah digunakan artikel lain. Gunakan slug yang unik.",
      },
    };
  }

  const publishedAt = validation.data.status === "PUBLISHED" ? new Date() : null;

  try {
    const created = await prisma.article.create({
      data: {
        ...validation.data,
        publishedAt,
      },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.articles);
    revalidateTag(ADMIN_CACHE_TAGS.articles);
    revalidateTag(ADMIN_CACHE_TAGS.dashboard);

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating article:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menyimpan artikel." },
    };
  }
}

export async function updateArticleAction(id: string, formData: FormData) {
  await requireAdminSession();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const content = (formData.get("content") as string)?.trim();
  const coverImageUrlRaw = formData.get("coverImageUrl") as string;
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || null;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || null;
  const status = (formData.get("status") as ContentStatus) || "DRAFT";

  const coverImageUrl =
    coverImageUrlRaw && coverImageUrlRaw.trim().length > 0
      ? coverImageUrlRaw.trim()
      : null;

  const validation = articleInputSchema.safeParse({
    title,
    slug,
    content,
    coverImageUrl,
    metaTitle,
    metaDescription,
    status,
  });

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message || "Input tidak valid",
      },
    };
  }

  const existingArticle = await prisma.article.findUnique({
    where: { id },
  });

  if (!existingArticle) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Artikel tidak ditemukan" },
    };
  }

  // Check unique slug on other articles
  const duplicateSlug = await prisma.article.findFirst({
    where: {
      slug: validation.data.slug,
      NOT: { id },
    },
  });

  if (duplicateSlug) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Slug sudah digunakan artikel lain. Gunakan slug yang unik.",
      },
    };
  }

  // Rule: publishedAt is set when first published, and preserved afterwards
  let publishedAt = existingArticle.publishedAt;
  if (validation.data.status === "PUBLISHED" && !publishedAt) {
    publishedAt = new Date();
  }

  try {
    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...validation.data,
        publishedAt,
      },
    });

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}/edit`);
    revalidatePath("/articles");
    revalidatePath(`/articles/${updated.slug}`);
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.articles);
    revalidateTag(ADMIN_CACHE_TAGS.articles);
    revalidateTag(ADMIN_CACHE_TAGS.dashboard);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating article:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal memperbarui artikel." },
    };
  }
}

export async function deleteArticleAction(id: string) {
  await requireAdminSession();

  try {
    await prisma.article.delete({
      where: { id },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.articles);
    revalidateTag(ADMIN_CACHE_TAGS.articles);
    revalidateTag(ADMIN_CACHE_TAGS.dashboard);

    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menghapus artikel." },
    };
  }
}
