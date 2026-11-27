"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { z } from "zod";
import { isSafeMediaUrl } from "@/lib/safe-url";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";
import { ADMIN_CACHE_TAGS, getCachedAdminSiteSetting } from "@/lib/admin-data";

const siteSettingSchema = z.object({
  brandName: z.string().min(1, "Nama brand wajib diisi").default("TechFixSoftware"),
  logoUrl: z
    .string()
    .refine(isSafeMediaUrl, "URL logo harus berupa path lokal (/...) atau HTTPS valid")
    .optional()
    .nullable(),
  whatsappNumber: z.string().optional().nullable(),
  minPriceLabel: z.string().min(1, "Label harga minimum wajib diisi").default("mulai dari Rp50.000"),
});

export type SiteSettingData = {
  id: string;
  brandName: string;
  logoUrl: string | null;
  whatsappNumber: string | null;
  minPriceLabel: string;
};

export async function getSiteSetting(): Promise<SiteSettingData> {
  await requireAdminSession();
  return getCachedAdminSiteSetting();
}

export async function updateSiteSetting(formData: FormData) {
  await requireAdminSession();

  const brandName = (formData.get("brandName") as string) || "TechFixSoftware";
  const logoUrlRaw = formData.get("logoUrl") as string;
  const whatsappNumberRaw = formData.get("whatsappNumber") as string;
  const minPriceLabel = (formData.get("minPriceLabel") as string) || "mulai dari Rp50.000";

  // Critical requirement: empty whatsappNumber stored as NULL, not empty string
  const whatsappNumber =
    whatsappNumberRaw && whatsappNumberRaw.trim().length > 0
      ? whatsappNumberRaw.trim()
      : null;

  const logoUrl =
    logoUrlRaw && logoUrlRaw.trim().length > 0 ? logoUrlRaw.trim() : null;

  const validation = siteSettingSchema.safeParse({
    brandName,
    logoUrl,
    whatsappNumber,
    minPriceLabel,
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
    const updated = await prisma.siteSetting.upsert({
      where: { id: "singleton" },
      update: {
        brandName: validation.data.brandName,
        logoUrl: validation.data.logoUrl,
        whatsappNumber: validation.data.whatsappNumber,
        minPriceLabel: validation.data.minPriceLabel,
      },
      create: {
        id: "singleton",
        brandName: validation.data.brandName,
        logoUrl: validation.data.logoUrl,
        whatsappNumber: validation.data.whatsappNumber,
        minPriceLabel: validation.data.minPriceLabel,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/services");
    revalidateTag(PUBLIC_CACHE_TAGS.settings);
    revalidateTag(ADMIN_CACHE_TAGS.settings);

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("Error updating site setting:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Gagal menyimpan pengaturan situs ke database.",
      },
    };
  }
}
