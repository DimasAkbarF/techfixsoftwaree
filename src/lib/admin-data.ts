import { cache } from "react";
import { unstable_cache } from "next/cache";
import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const ADMIN_CACHE_TAGS = {
  dashboard: "admin-dashboard",
  leads: "admin-leads",
  services: "admin-services",
  articles: "admin-articles",
  roms: "admin-roms",
  testimonials: "admin-testimonials",
  settings: "admin-settings",
} as const;

export interface AdminDashboardSummary {
  newLeadsCount: number;
  activeServicesCount: number;
  articlesCount: number;
  testimonialsCount: number;
  dueLeadsCount: number;
  dueLeads: Array<{
    id: string;
    name: string;
    deviceType: string;
    status: string;
    nextFollowUpAt: Date | string | null;
  }>;
}

const fetchAdminDashboardCached = unstable_cache(
  async (): Promise<AdminDashboardSummary> => {
    const dueWhere = {
      OR: [
        { status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED] } },
        { status: LeadStatus.SCHEDULED, nextFollowUpAt: { lte: new Date() } },
      ],
    };

    const [counts, dueList] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          new_leads: number;
          active_services: number;
          articles: number;
          testimonials: number;
          due_leads: number;
        }>
      >`
        SELECT
          (SELECT count(*)::int FROM "Lead" WHERE status = 'NEW') AS new_leads,
          (SELECT count(*)::int FROM "Service" WHERE "isPublished" = true) AS active_services,
          (SELECT count(*)::int FROM "Article") AS articles,
          (SELECT count(*)::int FROM "Testimonial") AS testimonials,
          (SELECT count(*)::int FROM "Lead"
            WHERE status IN ('NEW', 'CONTACTED')
               OR (status = 'SCHEDULED' AND "nextFollowUpAt" <= NOW())) AS due_leads
      `,
      prisma.lead.findMany({
        where: dueWhere,
        orderBy: [{ nextFollowUpAt: "asc" }, { createdAt: "asc" }],
        take: 5,
        select: {
          id: true,
          name: true,
          deviceType: true,
          status: true,
          nextFollowUpAt: true,
        },
      }),
    ]);

    const row = counts[0];
    return {
      newLeadsCount: Number(row?.new_leads) || 0,
      activeServicesCount: Number(row?.active_services) || 0,
      articlesCount: Number(row?.articles) || 0,
      testimonialsCount: Number(row?.testimonials) || 0,
      dueLeadsCount: Number(row?.due_leads) || 0,
      dueLeads: dueList,
    };
  },
  ["admin-dashboard-summary"],
  {
    revalidate: 60,
    tags: [
      ADMIN_CACHE_TAGS.dashboard,
      ADMIN_CACHE_TAGS.leads,
      ADMIN_CACHE_TAGS.services,
      ADMIN_CACHE_TAGS.articles,
      ADMIN_CACHE_TAGS.testimonials,
    ],
  }
);

const fetchAdminServicesCached = unstable_cache(
  async () =>
    prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        priceFromLabel: true,
        icon: true,
        sortOrder: true,
        isPublished: true,
      },
    }),
  ["admin-services-list"],
  { revalidate: 60, tags: [ADMIN_CACHE_TAGS.services] }
);

const fetchAdminArticlesCached = unstable_cache(
  async () =>
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
      },
    }),
  ["admin-articles-list"],
  { revalidate: 60, tags: [ADMIN_CACHE_TAGS.articles] }
);

const fetchAdminRomsCached = unstable_cache(
  async () =>
    prisma.rom.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        logoUrl: true,
        sortOrder: true,
        isPublished: true,
      },
    }),
  ["admin-roms-list"],
  { revalidate: 60, tags: [ADMIN_CACHE_TAGS.roms] }
);

const fetchAdminTestimonialsCached = unstable_cache(
  async () =>
    prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        deviceType: true,
        review: true,
        rating: true,
        isPublished: true,
      },
    }),
  ["admin-testimonials-list"],
  { revalidate: 60, tags: [ADMIN_CACHE_TAGS.testimonials] }
);

const fetchAdminLeadsCached = unstable_cache(
  async (statusKey: string) => {
    const whereClause: { status?: LeadStatus } = {};
    if (
      statusKey !== "ALL" &&
      Object.values(LeadStatus).includes(statusKey as LeadStatus)
    ) {
      whereClause.status = statusKey as LeadStatus;
    }

    return prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        service: { select: { id: true, name: true, slug: true } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    });
  },
  ["admin-leads-list"],
  { revalidate: 60, tags: [ADMIN_CACHE_TAGS.leads] }
);

const fetchAdminSiteSettingCached = unstable_cache(
  async () =>
    prisma.siteSetting.findUnique({
      where: { id: "singleton" },
      select: {
        id: true,
        brandName: true,
        logoUrl: true,
        whatsappNumber: true,
        minPriceLabel: true,
      },
    }),
  ["admin-site-setting"],
  { revalidate: 60, tags: [ADMIN_CACHE_TAGS.settings] }
);

export const getCachedAdminDashboard = cache(async (): Promise<AdminDashboardSummary> => {
  try {
    return await fetchAdminDashboardCached();
  } catch (error) {
    console.error("admin-data: gagal memuat dashboard", error);
    return {
      newLeadsCount: 0,
      activeServicesCount: 0,
      articlesCount: 0,
      testimonialsCount: 0,
      dueLeadsCount: 0,
      dueLeads: [],
    };
  }
});

export const getCachedAdminServices = cache(async () => {
  try {
    return await fetchAdminServicesCached();
  } catch (error) {
    console.error("admin-data: gagal memuat layanan", error);
    return [];
  }
});

export const getCachedAdminArticles = cache(async () => {
  try {
    return await fetchAdminArticlesCached();
  } catch (error) {
    console.error("admin-data: gagal memuat artikel", error);
    return [];
  }
});

export const getCachedAdminRoms = cache(async () => {
  try {
    return await fetchAdminRomsCached();
  } catch (error) {
    console.error("admin-data: gagal memuat rom", error);
    return [];
  }
});

export const getCachedAdminTestimonials = cache(async () => {
  try {
    return await fetchAdminTestimonialsCached();
  } catch (error) {
    console.error("admin-data: gagal memuat testimoni", error);
    return [];
  }
});

export const getCachedAdminLeads = cache(async (status?: string) => {
  try {
    const key =
      status && Object.values(LeadStatus).includes(status as LeadStatus)
        ? status
        : "ALL";
    return await fetchAdminLeadsCached(key);
  } catch (error) {
    console.error("admin-data: gagal memuat leads", error);
    return [];
  }
});

export const getCachedAdminSiteSetting = cache(async () => {
  try {
    const setting = await fetchAdminSiteSettingCached();
    if (!setting) {
      return {
        id: "singleton",
        brandName: "TechFixSoftware",
        logoUrl: null,
        whatsappNumber: null,
        minPriceLabel: "mulai dari Rp50.000",
      };
    }
    return setting;
  } catch (error) {
    console.error("admin-data: gagal memuat site setting", error);
    return {
      id: "singleton",
      brandName: "TechFixSoftware",
      logoUrl: null,
      whatsappNumber: null,
      minPriceLabel: "mulai dari Rp50.000",
    };
  }
});
