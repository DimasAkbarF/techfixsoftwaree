import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const handler = toNextJsHandler(auth.handler);

// Batasi percobaan login admin agar kebal terhadap brute-force password.
const checkAuthRateLimit = createRateLimiter({
  windowMs: 15 * 60_000, // 15 menit
  max: 10,
});

export const GET = handler.GET;

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.includes("/sign-in") || pathname.includes("/sign-up")) {
    const ip = getClientIp(request.headers);
    const limit = checkAuthRateLimit(`auth:${ip}`);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          code: "RATE_LIMITED",
          message: `Terlalu banyak percobaan login. Coba lagi dalam ${limit.retryAfterSec} detik.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        }
      );
    }
  }

  return handler.POST(request);
}
