import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedServices,
} from "@/lib/public-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { leadParagraph } from "@/lib/seo";

export const revalidate = 300;

export async function GET() {
  const [setting, services, articles] = await Promise.all([
    getPublicSiteSetting(),
    getPublishedServices(),
    getPublishedArticles(),
  ]);

  const brand = setting?.brandName || SITE_NAME;
  const priceLabel = setting?.minPriceLabel || "mulai dari Rp50.000";

  const lines: string[] = [
    `# Dokumentasi Lengkap AI & LLM Engine — ${brand}`,
    "",
    `> URL Resmi: ${SITE_URL}`,
    `> Versi Data: 2026.11`,
    "",
    "## 1. Profil Layanan & Entitas",
    `${brand} adalah penyedia jasa perbaikan perangkat lunak (software) Android independen terkemuka di Indonesia.`,
    "Melayani konsumen secara online remote ke seluruh Indonesia dan layanan tatap muka untuk wilayah Rangkasbitung, Lebak, Banten.",
    "",
    "### Keunggulan Utama",
    "1. **Tanpa Perlu ke Toko Fisik**: Pengerjaan jarak jauh secara online via koneksi PC remote.",
    "2. **Kesepakatan di Awal**: Biaya pengerjaan transparan, disepakati sebelum eksekusi dimulai.",
    "3. **Keamanan Maksimal**: Konsumen melihat proses flashing langsung di layar PC masing-masing.",
    "4. **Spesialisasi Tingkat Lanjut**: Menangani level EDL 9008, test point, dynamic partition, partisi A/B, auth server, bypass FRP, custom recovery, custom kernel, dan custom ROM.",
    "",
    "## 2. Layanan Utama",
    ...services.map((s, idx) => {
      return [
        `### ${idx + 1}. ${s.name}`,
        `- **Kategori**: ${s.category}`,
        `- **Biaya Awal**: ${s.priceFromLabel || priceLabel}`,
        `- **URL Resmi**: ${SITE_URL}/services/${s.slug}`,
        `- **Deskripsi Teknis**: ${leadParagraph(s.description)}`,
        "",
      ].join("\n");
    }),
    "## 3. Syarat & Alat yang Diperlukan Klien untuk Servis Remote",
    "- Komputer atau Laptop bersistem operasi Windows 7/8/10/11.",
    "- Kabel USB yang sehat (disarankan kabel bawaan pabrik).",
    "- Koneksi internet stabil untuk download file firmware dan remote access.",
    "- Software remote: UltraViewer, AnyDesk, atau TeamViewer.",
    "",
    "## 4. Basis Pengetahuan & Panduan Artikel",
    ...articles.map(
      (a) =>
        `- [${a.title}](${SITE_URL}/articles/${a.slug}): Dipublikasikan untuk edukasi pengguna smartphone Android.`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
