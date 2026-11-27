import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const trackRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
});

const trackSchema = z.object({
  ticketCode: z
    .string()
    .trim()
    .min(6, "Kode tiket minimal 6 karakter.")
    .max(32, "Kode tiket terlalu panjang.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Kode tiket hanya boleh berisi huruf dan angka."),
  phoneLast4: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Masukkan tepat 4 digit terakhir nomor WhatsApp Anda."),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = trackRateLimit(`track:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfterSec} detik.`,
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Format permintaan tidak valid." },
      },
      { status: 400 }
    );
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Data tidak valid.",
        },
      },
      { status: 422 }
    );
  }

  const normalizedTicket = parsed.data.ticketCode.toLowerCase();
  const { phoneLast4 } = parsed.data;

  try {
    const candidates = await prisma.lead.findMany({
      where: {
        id: {
          endsWith: normalizedTicket,
          mode: "insensitive",
        },
      },
      include: {
        service: { select: { name: true, slug: true } },
        activities: {
          where: {
            kind: { in: ["STATUS", "FOLLOW_UP"] },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const matched = candidates.find((lead) => {
      if (!lead.phone) return false;
      const digits = lead.phone.replace(/\D/g, "");
      return digits.length >= 4 && digits.endsWith(phoneLast4);
    });

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message:
              "Tiket servis tidak ditemukan. Pastikan kode tiket dan 4 digit terakhir nomor WhatsApp sesuai.",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ticketCode: matched.id.slice(-6).toUpperCase(),
        deviceType: matched.deviceType,
        serviceName: matched.service?.name || "Konsultasi Servis Software",
        serviceSlug: matched.service?.slug || null,
        status: matched.status,
        createdAt: matched.createdAt.toISOString(),
        contactedAt: matched.contactedAt ? matched.contactedAt.toISOString() : null,
        nextFollowUpAt: matched.nextFollowUpAt ? matched.nextFollowUpAt.toISOString() : null,
        updatedAt: matched.updatedAt.toISOString(),
        activities: matched.activities.map((a) => ({
          id: a.id,
          kind: a.kind,
          message: a.message,
          createdAt: a.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error("[leads/track] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan saat memeriksa status servis.",
        },
      },
      { status: 500 }
    );
  }
}
