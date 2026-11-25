import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedServices,
} from "@/lib/public-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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
    `# ${brand}`,
    "",
    `> Layanan servis software Android (remote seluruh Indonesia & Rangkasbitung) untuk bootloop, brick, stuck logo, flash firmware, root, custom ROM, recovery, dan downgrade. Tidak ada toko fisik; konsultasi diawali via WhatsApp dan harga final disepakati sebelum device diserahkan (${priceLabel}).`,
    "",
    "## Halaman Utama",
    `- [Beranda](${SITE_URL}/): Ringkasan layanan, daftar custom ROM, alur servis, testimoni, catatan servis, dan form konsultasi WhatsApp.`,
    `- [Katalog Layanan](${SITE_URL}/services): Daftar lengkap layanan servis software Android beserta kategori dan estimasi awal.`,
    `- [Cara Kerja Layanan](${SITE_URL}/cara-kerja): Empat langkah alur servis (konsultasi WhatsApp, kesepakatan harga, perjanjian, pengerjaan remote atau penyerahan device dengan kabel USB).`,
    `- [Artikel & Panduan](${SITE_URL}/articles): Panduan teknis seputar bootloop, brick, flashing firmware, root, dan custom ROM.`,
    `- [Testimoni & Bukti Servis](${SITE_URL}/testimonials): Dokumentasi kasus dan ulasan pelanggan.`,
    "",
    "## Layanan Tersedia",
    ...services.map(
      (s) =>
        `- [${s.name}](${SITE_URL}/services/${s.slug}) (${s.category}, ${s.priceFromLabel}): ${s.description}`
    ),
    "",
    "## Panduan Terbaru",
    ...articles
      .slice(0, 12)
      .map((a) => `- [${a.title}](${SITE_URL}/articles/${a.slug})`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
