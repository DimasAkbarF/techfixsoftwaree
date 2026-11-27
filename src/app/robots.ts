import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Izinkan semua crawler AI Search & LLM Engine untuk sitasi jawaban
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow },
      { userAgent: "GPTBot", allow: "/", disallow },
      { userAgent: "Claude-SearchBot", allow: "/", disallow },
      { userAgent: "ClaudeBot", allow: "/", disallow },
      { userAgent: "anthropic-ai", allow: "/", disallow },
      { userAgent: "PerplexityBot", allow: "/", disallow },
      { userAgent: "Google-Extended", allow: "/", disallow },
      { userAgent: "GoogleOther", allow: "/", disallow },
      { userAgent: "Bingbot", allow: "/", disallow },
      { userAgent: "Applebot-Extended", allow: "/", disallow },
      { userAgent: "Meta-ExternalAgent", allow: "/", disallow },
      { userAgent: "FacebookBot", allow: "/", disallow },
      { userAgent: "Amazonbot", allow: "/", disallow },
      { userAgent: "Bytespider", allow: "/", disallow },
      { userAgent: "CCBot", allow: "/", disallow },
      { userAgent: "cohere-ai", allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
