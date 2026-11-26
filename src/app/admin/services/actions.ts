"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";

const serviceInputSchema = z.object({
  name: z.string().min(2, "Nama layanan minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"),
  category: z.string().min(2, "Kategori wajib diisi"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  symptoms: z.array(z.string()).default([]),
  preparation: z.array(z.string()).default([]),
  priceFromLabel: z.string().min(3, "Label harga wajib diisi").default("mulai dari Rp50.000"),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export type ServiceFormData = z.infer<typeof serviceInputSchema>;

export async function getAdminServices() {
  await requireAdminSession();
  try {
    return await prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        priceFromLabel: true,
        icon: true,
        sortOrder: true,
        isPublished: true,
      },
    });
  } catch (err) {
    console.error("Error fetching services:", err);
    return [];
  }
}

export async function getAdminServiceById(id: string) {
  await requireAdminSession();
  try {
    return await prisma.service.findUnique({
      where: { id },
    });
  } catch (err) {
    console.error("Error fetching service by ID:", err);
    return null;
  }
}

export async function createServiceAction(formData: FormData) {
  await requireAdminSession();

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const symptomsRaw = formData.get("symptoms") as string;
  const preparationRaw = formData.get("preparation") as string;
  const priceFromLabel = (formData.get("priceFromLabel") as string) || "mulai dari Rp50.000";
  const icon = (formData.get("icon") as string)?.trim() || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;
  const isPublished = formData.get("isPublished") === "on" || formData.get("isPublished") === "true";

  const symptoms = symptomsRaw
    ? symptomsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const preparation = preparationRaw
    ? preparationRaw
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const validation = serviceInputSchema.safeParse({
    name,
    slug,
    category,
    description,
    symptoms,
    preparation,
    priceFromLabel,
    icon,
    sortOrder,
    isPublished,
  });

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message || "Input tidak valid",
        details: validation.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    };
  }

  try {
    // Check slug uniqueness
    const existingSlug = await prisma.service.findUnique({
      where: { slug: validation.data.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Slug sudah digunakan oleh layanan lain. Gunakan slug yang unik.",
        },
      };
    }

    const created = await prisma.service.create({
      data: validation.data,
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.services);

    return {
      success: true,
      data: created,
    };
  } catch (err: unknown) {
    console.error("Error creating service:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Gagal menyimpan layanan ke database.",
      },
    };
  }
}

export async function updateServiceAction(id: string, formData: FormData) {
  await requireAdminSession();

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const symptomsRaw = formData.get("symptoms") as string;
  const preparationRaw = formData.get("preparation") as string;
  const priceFromLabel = (formData.get("priceFromLabel") as string) || "mulai dari Rp50.000";
  const icon = (formData.get("icon") as string)?.trim() || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;
  const isPublished = formData.get("isPublished") === "on" || formData.get("isPublished") === "true";

  const symptoms = symptomsRaw
    ? symptomsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const preparation = preparationRaw
    ? preparationRaw
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const validation = serviceInputSchema.safeParse({
    name,
    slug,
    category,
    description,
    symptoms,
    preparation,
    priceFromLabel,
    icon,
    sortOrder,
    isPublished,
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

  try {
    // Check if slug belongs to another service
    const existingSlug = await prisma.service.findFirst({
      where: {
        slug: validation.data.slug,
        NOT: { id },
      },
    });

    if (existingSlug) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Slug sudah digunakan oleh layanan lain. Gunakan slug yang unik.",
        },
      };
    }

    const updated = await prisma.service.update({
      where: { id },
      data: validation.data,
    });

    revalidatePath("/admin/services");
    revalidatePath(`/admin/services/${id}/edit`);
    revalidatePath("/services");
    revalidatePath(`/services/${updated.slug}`);
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.services);

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("Error updating service:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Gagal memperbarui layanan.",
      },
    };
  }
}

export async function deleteServiceAction(id: string) {
  await requireAdminSession();

  try {
    // Lead.serviceId will be set to NULL automatically by Prisma (onDelete: SetNull)
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.services);

    return { success: true };
  } catch (err: unknown) {
    console.error("Error deleting service:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Gagal menghapus layanan.",
      },
    };
  }
}
