import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findFirst({
      where: {
        slug: slug.toLowerCase(),
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        symptoms: true,
        preparation: true,
        priceFromLabel: true,
        icon: true,
        sortOrder: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Layanan tidak ditemukan atau belum dipublikasikan",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/services/[slug]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memuat detail layanan",
        },
      },
      { status: 500 }
    );
  }
}
