import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.max(1, parseInt(searchParams.get("perPage") || "20", 10));

    const whereClause: { isPublished: boolean; category?: string } = {
      isPublished: true,
    };

    if (category && category.trim().length > 0) {
      whereClause.category = category.trim();
    }

    const [total, services] = await Promise.all([
      prisma.service.count({ where: whereClause }),
      prisma.service.findMany({
        where: whereClause,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          priceFromLabel: true,
          icon: true,
          sortOrder: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      success: true,
      data: services,
      meta: {
        page,
        perPage,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/services:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memuat katalog layanan",
        },
      },
      { status: 500 }
    );
  }
}
