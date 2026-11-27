import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-data";
import { ADMIN_CACHE_TAGS } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const testimonialSchema = z.object({
  customerName: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter"),
  deviceType: z.string().trim().min(2, "Tipe perangkat minimal 2 karakter"),
  review: z.string().trim().min(5, "Ulasan minimal 5 karakter"),
  rating: z.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  isPublished: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
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

  const validation = testimonialSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message || "Input tidak valid",
          details: validation.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
      },
      { status: 422 }
    );
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: validation.data,
    });

    revalidateTag(PUBLIC_CACHE_TAGS.testimonials);
    revalidateTag(ADMIN_CACHE_TAGS.testimonials);
    revalidateTag(ADMIN_CACHE_TAGS.dashboard);

    return NextResponse.json(
      {
        success: true,
        data: testimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/v1/admin/testimonials:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal menyimpan testimoni ke database",
        },
      },
      { status: 500 }
    );
  }
}
