import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    // Neon cold-start & lintas region bisa melewati default Prisma connect_timeout (5s).
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "30");
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}

const datasourceUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
