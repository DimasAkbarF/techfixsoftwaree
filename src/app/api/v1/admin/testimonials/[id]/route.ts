import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";
import { ADMIN_CACHE_TAGS } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchTestimonialSchema = z.object({
  customerName: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter").optional(),
  deviceType: z.string().trim().min(2, "Tipe perangkat minimal 2 karakter").optional(),
  review: z.string().trim().min(5, "Ulasan minimal 5 karakter").optional(),
  rating: z.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5").optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Sesi admin tidak ada atau kedaluwarsa",
        },
      },
      { status: 401 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Format request body tidak valid JSON",
        },
      },
      { status: 422 }
    );
  }

  const validation = patchTestimonialSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message || "Input tidak valid",
        },
      },
      { status: 422 }
    );
  }

  try {
    const updated = await prisma.testimonial.update({
      where: { id },
      data: validation.data,
    });

    revalidateTag(PUBLIC_CACHE_TAGS.testimonials);
    revalidateTag(ADMIN_CACHE_TAGS.testimonials);
    revalidateTag(ADMIN_CACHE_TAGS.dashboard);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/v1/admin/testimonials/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memperbarui testimoni",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Sesi admin tidak ada atau kedaluwarsa",
        },
      },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    revalidateTag(PUBLIC_CACHE_TAGS.testimonials);
    revalidateTag(ADMIN_CACHE_TAGS.testimonials);
    revalidateTag(ADMIN_CACHE_TAGS.dashboard);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/v1/admin/testimonials/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal menghapus testimoni",
        },
      },
      { status: 500 }
    );
  }
}
