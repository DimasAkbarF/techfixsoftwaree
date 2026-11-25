import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const PUBLIC_CACHE_TAGS = {
  settings: "public-settings",
  services: "public-services",
  articles: "public-articles",
  testimonials: "public-testimonials",
  roms: "public-roms",
} as const;

export type CachedSiteSetting = {
  brandName: string;
  logoUrl: string | null;
  whatsappNumber: string | null;
  minPriceLabel: string;
} | null;

export type CachedService = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  symptoms: string[];
  preparation: string[];
  priceFromLabel: string;
  icon: string | null;
  sortOrder: number;
  updatedAt: Date | string;
};

export type CachedArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
};

export type CachedTestimonial = {
  id: string;
  customerName: string;
  deviceType: string;
  review: string;
  rating: number;
  imageUrl: string | null;
  createdAt: Date | string;
};

export type CachedRom = {
  name: string;
  logoUrl: string;
};

const fetchSiteSettingCached = unstable_cache(
  async (): Promise<CachedSiteSetting> =>
    prisma.siteSetting.findUnique({
      where: { id: "singleton" },
      select: {
        brandName: true,
        logoUrl: true,
        whatsappNumber: true,
        minPriceLabel: true,
      },
    }),
  ["public-site-setting"],
  { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.settings] }
);

const fetchPublishedServicesCached = unstable_cache(
  async (): Promise<CachedService[]> =>
    prisma.service.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
        updatedAt: true,
      },
    }),
  ["public-published-services"],
  { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.services] }
);

const fetchPublishedArticlesCached = unstable_cache(
  async (): Promise<CachedArticle[]> =>
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        coverImageUrl: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
  ["public-published-articles"],
  { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.articles] }
);

const fetchPublishedTestimonialsCached = unstable_cache(
  async (): Promise<CachedTestimonial[]> =>
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        deviceType: true,
        review: true,
        rating: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
  ["public-published-testimonials"],
  { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.testimonials] }
);

const fetchPublishedRomsCached = unstable_cache(
  async (): Promise<CachedRom[]> =>
    prisma.rom.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { name: true, logoUrl: true },
    }),
  ["public-published-roms"],
  { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.roms] }
);

// React cache() men-dedup panggilan identik dalam satu render tree (layout + header + page).
// try/catch berada di luar unstable_cache agar error koneksi sementara tidak ikut ter-cache.
export const getPublicSiteSetting = cache(async (): Promise<CachedSiteSetting> => {
  try {
    return await fetchSiteSettingCached();
  } catch (error) {
    console.error("public-data: gagal memuat site setting", error);
    return null;
  }
});

export const getPublishedServices = cache(async (): Promise<CachedService[]> => {
  try {
    return await fetchPublishedServicesCached();
  } catch (error) {
    console.error("public-data: gagal memuat layanan", error);
    return [];
  }
});

export const getPublishedServiceBySlug = cache(
  async (slug: string): Promise<CachedService | null> => {
    const normalized = slug.toLowerCase();
    const services = await getPublishedServices();
    return services.find((service) => service.slug === normalized) ?? null;
  }
);

export const getPublishedArticles = cache(async (): Promise<CachedArticle[]> => {
  try {
    return await fetchPublishedArticlesCached();
  } catch (error) {
    console.error("public-data: gagal memuat artikel", error);
    return [];
  }
});

export const getPublishedArticleBySlug = cache(
  async (slug: string): Promise<CachedArticle | null> => {
    const normalized = slug.toLowerCase();
    const articles = await getPublishedArticles();
    return articles.find((article) => article.slug === normalized) ?? null;
  }
);

export const getPublishedTestimonials = cache(async (): Promise<CachedTestimonial[]> => {
  try {
    return await fetchPublishedTestimonialsCached();
  } catch (error) {
    console.error("public-data: gagal memuat testimoni", error);
    return [];
  }
});

export const getPublishedRoms = cache(async (): Promise<CachedRom[]> => {
  try {
    return await fetchPublishedRomsCached();
  } catch (error) {
    console.error("public-data: gagal memuat rom", error);
    return [];
  }
});
