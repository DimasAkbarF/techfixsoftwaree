"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";

const testimonialInputSchema = z.object({
  customerName: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter"),
  deviceType: z.string().trim().min(2, "Tipe perangkat minimal 2 karakter"),
  review: z.string().trim().min(5, "Ulasan minimal 5 karakter"),
  rating: z.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  isPublished: z.boolean().default(false),
});

export type TestimonialFormData = z.infer<typeof testimonialInputSchema>;

export async function getAdminTestimonials() {
  await requireAdminSession();
  try {
    return await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        deviceType: true,
        review: true,
        rating: true,
        isPublished: true,
      },
    });
  } catch (error) {
    console.error("Error fetching admin testimonials:", error);
    return [];
  }
}

export async function getAdminTestimonialById(id: string) {
  await requireAdminSession();
  try {
    return await prisma.testimonial.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching testimonial by id:", error);
    return null;
  }
}

export async function createTestimonialAction(formData: FormData) {
  await requireAdminSession();

  const customerName = (formData.get("customerName") as string)?.trim();
  const deviceType = (formData.get("deviceType") as string)?.trim();
  const review = (formData.get("review") as string)?.trim();
  const rating = parseInt(formData.get("rating") as string, 10);
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const isPublished = formData.get("isPublished") === "on" || formData.get("isPublished") === "true";

  const validation = testimonialInputSchema.safeParse({
    customerName,
    deviceType,
    review,
    rating,
    imageUrl,
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
    const created = await prisma.testimonial.create({
      data: validation.data,
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.testimonials);

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menyimpan testimoni." },
    };
  }
}

export async function updateTestimonialAction(id: string, formData: FormData) {
  await requireAdminSession();

  const customerName = (formData.get("customerName") as string)?.trim();
  const deviceType = (formData.get("deviceType") as string)?.trim();
  const review = (formData.get("review") as string)?.trim();
  const rating = parseInt(formData.get("rating") as string, 10);
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const isPublished = formData.get("isPublished") === "on" || formData.get("isPublished") === "true";

  const validation = testimonialInputSchema.safeParse({
    customerName,
    deviceType,
    review,
    rating,
    imageUrl,
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
    const updated = await prisma.testimonial.update({
      where: { id },
      data: validation.data,
    });

    revalidatePath("/admin/testimonials");
    revalidatePath(`/admin/testimonials/${id}/edit`);
    revalidatePath("/testimonials");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.testimonials);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal memperbarui testimoni." },
    };
  }
}

export async function deleteTestimonialAction(id: string) {
  await requireAdminSession();

  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");
    revalidateTag(PUBLIC_CACHE_TAGS.testimonials);

    return { success: true };
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menghapus testimoni." },
    };
  }
}
