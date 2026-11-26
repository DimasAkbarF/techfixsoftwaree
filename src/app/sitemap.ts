import type { MetadataRoute } from "next";
import { getPublishedArticles, getPublishedServices } from "@/lib/public-data";
import { SITE_URL } from "@/lib/site";

// Sama dengan halaman publik lain: segarkan tiap 5 menit.
export const revalidate = 300;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/cara-kerja`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE_URL}/testimonials`, changeFrequency: "weekly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, articles] = await Promise.all([
    getPublishedServices(),
    getPublishedArticles(),
  ]);

  const latestContentDate = [
    ...services.map((s) => new Date(s.updatedAt).getTime()),
    ...articles.map((a) => new Date(a.updatedAt).getTime()),
  ].reduce((max, t) => (t > max ? t : max), Date.now());
  const siteLastMod = new Date(latestContentDate);

  return [
    ...STATIC_PAGES.map((page) => ({ ...page, lastModified: siteLastMod })),
    ...services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: new Date(service.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
