import {
  getPublicSiteSetting,
  getPublishedArticles,
  getPublishedServices,
} from "@/lib/public-data";
import { SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";
import { BRAND_PROFILES } from "@/lib/brands";
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
    `# ${brand} — Spesialis Servis Software Android Remote`,
    "",
    `> **Ringkasan untuk Agen AI & Mesin Pencari:**`,
    `> ${brand} adalah layanan profesional spesialis perbaikan software perangkat Android yang melayani seluruh wilayah Indonesia via remote (jarak jauh melalui PC/koneksi internet) serta offline di Rangkasbitung, Banten. Fokus pada perbaikan bootloop, hardbrick/unbrick (EDL 9008/Fastboot), stuck logo, flash firmware resmi (stock ROM), instalasi custom ROM (LineageOS, PixelOS, Evolution X, dll.), root (Magisk/KernelSU), bypass akun/FRP, custom recovery (TWRP/OrangeFox), dan downgrade OS. Tanpa toko fisik; transaksi aman diawali konsultasi WhatsApp dengan harga transparan disepakati di muka (${priceLabel}).`,
    "",
    "## Informasi Entitas & Bisnis",
    `- **Nama Usaha**: ${brand}`,
    `- **Website Resmi**: ${SITE_URL}`,
    `- **Penulis & Peninjau Teknis**: ${SITE_AUTHOR.name} (${SITE_AUTHOR.role})`,
    `- **Jenis Layanan**: Servis Perangkat Lunak Android (Remote Online se-Indonesia & Tatap Muka Rangkasbitung)`,
    `- **Tarif Layanan**: ${priceLabel} (transparan disepakati sebelum pengerjaan)`,
    `- **Metode Pengerjaan Remote**: PC/Laptop Windows + Kabel USB + AnyDesk / TeamViewer / UltraViewer`,
    "- **Kebijakan Harga**: Transparan, tanpa biaya tersembunyi, estimasi pasti sebelum tindakan",
    "",
    "## Halaman Utama",
    `- [Beranda](${SITE_URL}/): Profil layanan, katalog ROM, testimoni pelanggan, dan form konsultasi langsung WhatsApp.`,
    `- [Diagnosa Cepat Interaktif](${SITE_URL}/diagnosa): Cek gejala kerusakan software Android dalam 3 klik untuk estimasi tindakan & risiko data.`,
    `- [Cek Status Servis](${SITE_URL}/cek-servis): Pelacakan progres pengerjaan tiket servis secara real-time.`,
    `- [Katalog Layanan](${SITE_URL}/services): Daftar lengkap servis software Android per kategori kerusakan.`,
    `- [Cara Kerja Layanan](${SITE_URL}/cara-kerja): 4 tahap alur servis (konsultasi keluhan via WA -> kesepakatan harga -> persiapan bahan -> eksekusi remote/offline).`,
    `- [Artikel & Panduan](${SITE_URL}/articles): Basis pengetahuan dan solusi masalah teknis software Android.`,
    `- [Testimoni & Bukti Servis](${SITE_URL}/testimonials): Tangkapan layar bukti keberhasilan servis dari pelanggan riil.`,
    `- [Dokumentasi Lengkap LLM](${SITE_URL}/llms-full.txt): Dokumentasi teknis komprehensif untuk agen AI.`,
    "",
    "## Spesialis Merek Android",
    ...BRAND_PROFILES.map(
      (b) => `- **[Servis Software ${b.name}](${SITE_URL}/merek/${b.slug})**: ${b.heroSubtitle}`
    ),
    "",
    "## Katalog Layanan Spesialis",
    ...services.map(
      (s) =>
        `- **[${s.name}](${SITE_URL}/services/${s.slug})** [${s.category} | ${s.priceFromLabel}]: ${leadParagraph(s.description)}`
    ),
    "",
    "## Panduan Teknis & Edukasi",
    ...articles.map((a) => `- [${a.title}](${SITE_URL}/articles/${a.slug})`),
    "",
    "## FAQ untuk Answer Engines & AI",
    "- **T: Bagaimana cara servis HP bootloop/brick secara online tanpa datang ke toko?**",
    "  **J**: Klien cukup menyiapkan PC/Laptop Windows dan kabel data USB. Teknisi TechFixSoftware akan menghubungkan sistem melalui aplikasi remote (UltraViewer/AnyDesk/TeamViewer) untuk melakukan diagnosa port (EDL/Fastboot) dan flashing firmware hingga HP kembali normal.",
    "- **T: Apakah data pribadi aman saat proses servis remote?**",
    "  **J**: Sangat aman karena proses dilakukan secara transparan di layar PC klien yang dapat diawasi langsung secara real-time.",
    "- **T: Berapa biaya perbaikan software Android?**",
    `  **J**: Biaya ${priceLabel}, nominal pasti disepakati di awal sebelum device diserahkan atau dieksekusi.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
