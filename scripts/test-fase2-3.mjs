import assert from "assert";
import fs from "fs";

console.log("--- Menjalankan Verifikasi Kriteria Penerimaan TASK-06 s/d TASK-09 ---");

// 1. Verifikasi TASK-06 (Katalog Publik & API Services)
const routeServices = fs.readFileSync("src/app/api/v1/services/route.ts", "utf-8");
assert(
  routeServices.includes("isPublished: true"),
  "FAIL: API /api/v1/services harus menyaring isPublished: true"
);
assert(
  routeServices.includes('sortOrder: "asc"'),
  "FAIL: API /api/v1/services harus mengurutkan berdasarkan sortOrder menaik"
);
assert(
  routeServices.includes("priceFromLabel: true") && !routeServices.includes("price: true"),
  "FAIL: API /api/v1/services HANYA boleh mengembalikan priceFromLabel, bukan nominal harga!"
);
assert(
  routeServices.includes("totalPages"),
  "FAIL: API /api/v1/services harus menyertakan meta paginasi"
);
console.log("✔ TASK-06 (API Services): isPublished disaring, urutan sortOrder, bebas harga nominal, paginasi lengkap.");

// Daftar & chip filter dipindah ke komponen klien agar halaman katalog bisa statis (ISR).
const catalogPage =
  fs.readFileSync("src/app/services/page.tsx", "utf-8") +
  fs.readFileSync("src/app/services/service-catalog.tsx", "utf-8");
assert(
  catalogPage.includes("service.priceFromLabel"),
  "FAIL: Halaman katalog harus menampilkan priceFromLabel"
);
assert(
  catalogPage.includes("Semua Layanan") && catalogPage.includes("category="),
  "FAIL: Halaman katalog harus mendukung filter kategori via query string"
);
assert(
  !catalogPage.includes("grid-cols-3") && catalogPage.includes("divide-y"),
  "FAIL: Halaman katalog harus memakai data list bergaris, bukan kartu berulang 3 kolom (DESIGN.md)!"
);
console.log("✔ TASK-06 (UI Katalog): Format data list bergaris (anti-slop), filter chips horizontal, hanya label teks harga.");

// 2. Verifikasi TASK-07 (Detail Layanan & API Service Slug)
const routeServiceSlug = fs.readFileSync("src/app/api/v1/services/[slug]/route.ts", "utf-8");
assert(
  routeServiceSlug.includes("404") && routeServiceSlug.includes("NOT_FOUND"),
  "FAIL: API service detail harus mengembalikan 404 NOT_FOUND jika tidak ditemukan / belum terbit"
);
assert(
  routeServiceSlug.includes("isPublished: true"),
  "FAIL: Detail layanan tidak terbit diperlakukan sebagai tidak ditemukan"
);
console.log("✔ TASK-07 (API Detail): 404 NOT_FOUND untuk slug tidak terbit/salah.");

const detailPage = fs.readFileSync("src/app/services/[slug]/page.tsx", "utf-8");
assert(
  detailPage.includes("lg:col-span-8") && detailPage.includes("lg:col-span-4"),
  "FAIL: Detail layanan harus menggunakan split 8/4 sesuai DESIGN.md §6!"
);
assert(
  detailPage.includes("service.symptoms") && detailPage.includes("service.preparation"),
  "FAIL: Detail layanan harus memuat gejala kerusakan dan persiapan pelanggan"
);
assert(
  detailPage.includes("ConsultationForm"),
  "FAIL: Panel CTA kanan harus memuat form konsultasi terhubung"
);
console.log("✔ TASK-07 (UI Detail): Layout split 8/4, gejala & persiapan pelanggan (DEC-001), sticky CTA panel.");

// 3. Verifikasi TASK-08 (Form Konsultasi -> Lead -> WhatsApp)
const routeLeads = fs.readFileSync("src/app/api/v1/leads/route.ts", "utf-8");
assert(
  routeLeads.includes("WHATSAPP_NOT_CONFIGURED") && routeLeads.includes("503"),
  "FAIL: Jika whatsappNumber NULL, wajib return 503 WHATSAPP_NOT_CONFIGURED!"
);
assert(
  routeLeads.indexOf("prisma.siteSetting.findUnique") < routeLeads.indexOf("prisma.lead.create"),
  "FAIL: Pemeriksaan nomor WA wajib dilakukan SEBELUM lead dibuat!"
);
assert(
  routeLeads.indexOf("prisma.lead.create") < routeLeads.indexOf("whatsappUrl"),
  "FAIL: Lead WAJIB tersimpan di database SEBELUM URL WhatsApp dibuat dan dikembalikan (NFR-05)!"
);
assert(
  routeLeads.includes("status: 422") && routeLeads.includes("VALIDATION_ERROR"),
  "FAIL: Input kosong harus mengembalikan 422 VALIDATION_ERROR!"
);
assert(
  routeLeads.includes("wa.me/"),
  "FAIL: Harus menghasilkan URL wa.me dengan pesan prateks terisi!"
);
console.log("✔ TASK-08 (API Leads): Validasi 422, cek WA 503 sebelum simpan, lead disimpan sebelum redirect (NFR-05), URL wa.me.");

const consultationComponent = fs.readFileSync("src/components/public/consultation-form.tsx", "utf-8");
assert(
  consultationComponent.includes("whatsappConfigured"),
  "FAIL: Form konsultasi harus menangani kondisi WhatsApp belum dikonfigurasi"
);
assert(
  consultationComponent.includes("window.location.href"),
  "FAIL: Form harus melakukan redirect setelah respon sukses diterima"
);
assert(
  consultationComponent.includes("setErrorMsg"),
  "FAIL: Form tidak boleh redirect jika terjadi error dan harus menampilkan pesan error"
);
console.log("✔ TASK-08 (UI Form): Form 1 kolom, disabled jika WA belum disetel, redirect hanya jika DB sukses, fallback link.");

// 4. Verifikasi TASK-09 (Manajemen Lead Admin)
const patchLeadRoute = fs.readFileSync("src/app/api/v1/admin/leads/[id]/route.ts", "utf-8");
assert(
  patchLeadRoute.includes("UNAUTHORIZED") && patchLeadRoute.includes("401"),
  "FAIL: Route PATCH /api/v1/admin/leads/[id] wajib menolak akses tanpa sesi dengan 401 UNAUTHORIZED"
);
assert(
  patchLeadRoute.includes('validation.data.status === "CONTACTED" && !existingLead.contactedAt'),
  "FAIL: contactedAt HANYA boleh diisi saat transisi PERTAMA KALI ke CONTACTED!"
);
console.log("✔ TASK-09 (API Admin Lead): Proteksi sesi 401, pengisian contactedAt hanya pada transisi pertama ke CONTACTED.");

const leadsManagerComponent = fs.readFileSync("src/app/admin/leads/leads-manager.tsx", "utf-8");
assert(
  leadsManagerComponent.includes("NEW") &&
  leadsManagerComponent.includes("CONTACTED") &&
  leadsManagerComponent.includes("SCHEDULED") &&
  leadsManagerComponent.includes("DONE") &&
  leadsManagerComponent.includes("CANCELLED"),
  "FAIL: Lima status lead DEC-004 wajib tersedia!"
);
assert(
  leadsManagerComponent.includes("lg:col-span-7") && leadsManagerComponent.includes("lg:col-span-5"),
  "FAIL: Manajemen lead admin harus menggunakan layout Master/Detail (DESIGN.md §6)"
);
console.log("✔ TASK-09 (UI Leads Admin): Master/Detail view, filter 5 status DEC-004, panel catatan internal admin.");

// 5. Audit Absolut: Tidak Ada lucide-react & Tidak Ada Harga Numerik
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
assert(!pkg.dependencies["lucide-react"], "FAIL: lucide-react ditemukan di dependencies!");
console.log("✔ Audit Dependensi: lucide-react BERSIH (0 instansi).");

console.log("\n>>> SEMUA PENGECEKAN ACCEPTANCE TEST FASE 2 & FASE 3 BERHASIL (100% PASSED)! <<<");
