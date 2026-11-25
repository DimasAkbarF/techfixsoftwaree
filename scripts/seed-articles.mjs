import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Simple .env.local / .env loader if dotenv is not installed
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

const BASE = "https://techfixsoftware.my.id";

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(text) {
  return decodeEntities(text.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function extractArticle(html, slug) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!articleMatch) throw new Error(`<article> tidak ditemukan: ${slug}`);

  let block = articleMatch[0]
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "");

  const h1 = block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1) throw new Error(`<h1> tidak ditemukan: ${slug}`);

  const jsonLd = articleMatch[0].match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
  );
  let meta = {};
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd[1]);
      meta = data.find((item) => item["@type"] === "Article") || {};
    } catch {}
  }

  // Mulai dari subjudul pertama agar blok penulis dan ringkasan tidak ikut.
  const firstH2 = block.indexOf("<h2", h1.index + h1[0].length);
  let bodyHtml = block.slice(firstH2 >= 0 ? firstH2 : h1.index + h1[0].length);

  // Buang CTA dan panduan terkait di bagian bawah artikel.
  const cutMarkers = [
    "Butuh bantuan penanganan teknis",
    "Layanan Terkait untuk Kondisi Ini",
    "Panduan Menarik Lainnya",
    "Konsultasikan dengan Teknisi",
    "Artikel Terkait",
  ];
  for (const marker of cutMarkers) {
    const idx = bodyHtml.indexOf(marker);
    if (idx >= 0) bodyHtml = bodyHtml.slice(0, idx);
  }

  const body = decodeEntities(
    bodyHtml
      .replace(/<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi, (_, tag, inner) => `\n\n${stripTags(inner)}\n`)
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `• ${stripTags(inner)}\n`)
      .replace(/<\/(p|ul|ol|blockquote|table)>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/TechFix(?:\s+Software)?/g, "TechFixSoftware")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

  const lead = stripTags(meta.description || "");
  const content = [lead, body].filter(Boolean).join("\n\n");

  return {
    title: stripTags(h1[1]),
    slug,
    content,
    metaTitle: stripTags(meta.headline || h1[1]),
    metaDescription: lead || null,
    publishedAt: meta.datePublished ? new Date(meta.datePublished) : null,
  };
}

async function main() {
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const guideSlugs = [...sitemap.matchAll(/<loc>[^<]*\/guides\/([a-z0-9-]+)<\/loc>/g)].map(
    (m) => m[1]
  );

  console.log(`Menemukan ${guideSlugs.length} panduan.`);

  let saved = 0;
  const failed = [];

  for (const slug of guideSlugs) {
    try {
      const html = await (await fetch(`${BASE}/guides/${slug}`)).text();
      const article = extractArticle(html, slug);

      if (article.content.length < 500) {
        throw new Error(`konten terlalu pendek (${article.content.length} karakter)`);
      }

      await prisma.article.upsert({
        where: { slug },
        update: {
          title: article.title,
          content: article.content,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          status: "PUBLISHED",
          publishedAt: article.publishedAt,
        },
        create: {
          ...article,
          status: "PUBLISHED",
        },
      });

      saved += 1;
      console.log(`OK   ${slug} (${article.content.length} karakter)`);
    } catch (error) {
      failed.push(slug);
      console.error(`GAGAL ${slug}: ${error.message}`);
    }
  }

  console.log(`\nSelesai: ${saved} tersimpan, ${failed.length} gagal.`);
  if (failed.length > 0) console.log(`Gagal: ${failed.join(", ")}`);
}

main()
  .catch((error) => {
    console.error("Impor artikel gagal:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
