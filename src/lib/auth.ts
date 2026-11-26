import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

function resolveBaseUrl() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function buildTrustedOrigins() {
  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  const origins = new Set<string>();
  for (const raw of candidates) {
    if (!raw || !raw.trim()) continue;
    const clean = raw.trim().replace(/\/+$/, "");
    origins.add(clean);
    if (clean.startsWith("https://www.")) {
      origins.add(clean.replace("https://www.", "https://"));
    } else if (clean.startsWith("https://") && !clean.includes(".vercel.app")) {
      origins.add(clean.replace("https://", "https://www."));
    }
  }
  return Array.from(origins);
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-techfixsoftware-key-min-32-chars",
  baseURL: resolveBaseUrl(),
  trustedOrigins: buildTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    // Signed cookie cache 5 menit: memangkas 1 round-trip DB Neon pada tiap navigasi /admin.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
