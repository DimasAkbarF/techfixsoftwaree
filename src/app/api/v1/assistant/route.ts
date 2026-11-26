import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedRoms,
  getPublishedServices,
} from "@/lib/public-data";
import { replyFromKnowledge } from "@/lib/assistant";

export const dynamic = "force-dynamic";

const assistantSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong")
    .max(400, "Pesan maksimal 400 karakter"),
});

// shortcut: rate limit in-memory di-reset saat cold start serverless; upgrade ke Redis/Upstash bila traffic tinggi.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30;
const rateBucket = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  if (rateBucket.size > 500) {
    for (const [key, entry] of rateBucket) {
      if (entry.resetAt <= now) rateBucket.delete(key);
    }
  }
  const current = rateBucket.get(ip);
  if (!current || current.resetAt <= now) {
    rateBucket.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Terlalu banyak pesan dalam waktu singkat. Coba lagi sebentar lagi.",
        },
      },
      { status: 429 }
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
