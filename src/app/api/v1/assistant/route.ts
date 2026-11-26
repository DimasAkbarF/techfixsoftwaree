import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedRoms,
  getPublishedServices,
} from "@/lib/public-data";
import { replyFromKnowledge } from "@/lib/assistant";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const assistantSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong")
    .max(400, "Pesan maksimal 400 karakter"),
});

const checkAssistantRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: 30,
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkAssistantRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Terlalu banyak pesan dalam waktu singkat. Coba lagi sebentar lagi.",
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
        error: {
          code: "VALIDATION_ERROR",
          message: "Format request tidak valid.",
        },
      },
      { status: 422 }
    );
  }

  const parsed = assistantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Pesan tidak valid.",
        },
      },
      { status: 422 }
    );
  }

  const [services, articles, roms, siteSetting] = await Promise.all([
    getPublishedServices(),
    getPublishedArticles(),
    getPublishedRoms(),
    getPublicSiteSetting(),
  ]);

  const reply = replyFromKnowledge(parsed.data.message, {
    services,
    articles,
    roms,
    siteSetting,
  });

  return NextResponse.json({ success: true, data: reply });
}
