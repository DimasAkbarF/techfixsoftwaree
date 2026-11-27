"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";
import { ADMIN_CACHE_TAGS, getCachedAdminRoms } from "@/lib/admin-data";

const romInputSchema = z.object({
  name: z.string().min(2, "Nama ROM minimal 2 karakter"),
  logoUrl: z.string().min(1, "Logo ROM wajib diunggah"),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function getAdminRoms() {
  await requireAdminSession();
  return getCachedAdminRoms();
}

export async function getAdminRomById(id: string) {
  await requireAdminSession();
  try {
    return await prisma.rom.findUnique({ where: { id } });
  } catch (err) {
    console.error("Error fetching rom by ID:", err);
    return null;
  }
}

function parseRomForm(formData: FormData) {
  return romInputSchema.safeParse({
    name: (formData.get("name") as string)?.trim(),
    logoUrl: (formData.get("logoUrl") as string)?.trim(),
    sortOrder: parseInt(formData.get("sortOrder") as string, 10) || 0,
    isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
  });
}

export async function createRomAction(formData: FormData) {
  await requireAdminSession();

  const validation = parseRomForm(formData);
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
    const created = await prisma.rom.create({ data: validation.data });

    revalidatePath("/admin/roms");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.roms);
    revalidateTag(ADMIN_CACHE_TAGS.roms);

    return { success: true, data: created };
  } catch (err: unknown) {
    console.error("Error creating rom:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menyimpan ROM ke database." },
    };
  }
}

export async function updateRomAction(id: string, formData: FormData) {
  await requireAdminSession();

  const validation = parseRomForm(formData);
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
    const updated = await prisma.rom.update({ where: { id }, data: validation.data });

    revalidatePath("/admin/roms");
    revalidatePath(`/admin/roms/${id}/edit`);
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.roms);
    revalidateTag(ADMIN_CACHE_TAGS.roms);

    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("Error updating rom:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal memperbarui ROM." },
    };
  }
}

export async function deleteRomAction(id: string) {
  await requireAdminSession();

  try {
    // Baris DB dihapus; file di UploadThing sengaja dibiarkan.
    await prisma.rom.delete({ where: { id } });

    revalidatePath("/admin/roms");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.roms);
    revalidateTag(ADMIN_CACHE_TAGS.roms);

    return { success: true };
  } catch (err: unknown) {
    console.error("Error deleting rom:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menghapus ROM." },
    };
  }
}
