import assert from "assert";
import fs from "fs";

console.log("--- Verifikasi halaman Cara Kerja + nav Layanan (Fase 5) ---");

const flow = fs.readFileSync("src/lib/service-flow.ts", "utf-8");
for (const title of [
  "Konsultasi via WhatsApp",
  "Kesepakatan harga",
  "Perjanjian",
  "Penyerahan device",
]) {
  assert(flow.includes(title), `FAIL: SERVICE_STEPS harus memuat tahap "${title}"`);
}
assert(flow.includes("customer:") && flow.includes("provider:"), "FAIL: tiap tahap butuh sisi customer dan provider");

const home = fs.readFileSync("src/app/page.tsx", "utf-8");
assert(home.includes("SERVICE_STEPS"), "FAIL: beranda harus mengimpor SERVICE_STEPS");
assert(!home.includes("const STEPS ="), "FAIL: STEPS lokal harus dihapus dari beranda");

console.log("✔ Task 1: modul alur tunggal dipakai beranda.");

const caraKerja = fs.readFileSync("src/app/cara-kerja/page.tsx", "utf-8");
assert(caraKerja.includes("SERVICE_STEPS"), "FAIL: halaman cara kerja harus memakai SERVICE_STEPS");
assert(!caraKerja.includes("@/lib/prisma"), "FAIL: halaman cara kerja tidak boleh menyentuh database");
assert(caraKerja.includes("PublicFooter") && caraKerja.includes("PublicHeader"), "FAIL: halaman butuh header/footer publik");
assert(caraKerja.includes('href="/#konsultasi"'), "FAIL: halaman butuh satu CTA ke form konsultasi");
assert(
  caraKerja.includes("export const revalidate = 300"),
  "FAIL: halaman publik harus memakai ISR (revalidate), bukan force-dynamic"
);
assert(home.includes('href="/cara-kerja"'), "FAIL: judul rail beranda harus menautkan cara kerja");
const footer = fs.readFileSync("src/components/public/public-footer.tsx", "utf-8");
assert(footer.includes('href="/cara-kerja"'), "FAIL: tiga poin Sebelum servis harus menautkan cara kerja");
console.log("✔ Task 2: halaman /cara-kerja ada dan mandiri dari database.");

const header = fs.readFileSync("src/components/public/public-header.tsx", "utf-8");
assert(header.includes("await prisma.service.findMany"), "FAIL: header harus mengambil layanan terbit");
assert(header.includes("take: 8"), "FAIL: dropdown dibatasi 8 layanan");
assert(header.includes("try {") && header.includes("catch"), "FAIL: header harus tahan database kosong");
assert(header.includes("Semua layanan") && header.includes("/cara-kerja"), "FAIL: dropdown butuh tautan tetap");
console.log("✔ Task 3: dropdown layanan di header terbaca dari database dengan fallback.");

const servicesPage =
  fs.readFileSync("src/app/services/page.tsx", "utf-8") +
  fs.readFileSync("src/app/services/service-catalog.tsx", "utf-8");
assert(servicesPage.includes("/cara-kerja"), "FAIL: halaman layanan harus menautkan cara kerja");
assert(!servicesPage.includes('from "@/components/ui/button"'), "FAIL: jangan bungkus Button di dalam Link");
assert(servicesPage.includes("Tidak ada layanan pada kategori ini"), "FAIL: empty state filter harus dipertahankan");
console.log("✔ Task 4: halaman layanan selaras dengan nav dan bebas Link>Button.");

const panelCap = (header.match(/max-h-\[calc\(100dvh-5rem\)\]/g) || []).length;
assert(panelCap === 2, "FAIL: kedua panel nav butuh batas tinggi + scroll");
assert(
  caraKerja.includes("mulai dari Rp50.000"),
  "FAIL: halaman cara kerja harus menyebut label harga awal"
);
assert(caraKerja.includes("Cara kerja layanan TechFixSoftware"), "FAIL: judul halaman harus menyebut TechFixSoftware");
console.log("✔ Final: panel nav terbatas tinggi, label harga cara kerja ada.");
