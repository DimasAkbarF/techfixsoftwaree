import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Izinkan crawler pencarian AI (bukan training-only) untuk sitasi jawaban AI.
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
      { userAgent: "Claude-SearchBot", allow: "/", disallow },
      { userAgent: "PerplexityBot", allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
