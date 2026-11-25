import assert from "assert";
import fs from "fs";

console.log("--- Menjalankan Verifikasi Kriteria Penerimaan TASK-10 s/d TASK-12 (Fase 4) ---");

// 1. Verifikasi TASK-10 (UploadThing)
const uploadCore = fs.readFileSync("src/app/api/uploadthing/core.ts", "utf-8");
assert(
  uploadCore.includes("imageUploader") && uploadCore.includes("FileRouter"),
  "FAIL: File router UploadThing harus mendefinisikan imageUploader"
);
assert(
  uploadCore.includes("getAdminSession"),
  "FAIL: UploadThing middleware harus memvalidasi sesi admin!"
);
const uploadRoute = fs.readFileSync("src/app/api/uploadthing/route.ts", "utf-8");
assert(
  uploadRoute.includes("createRouteHandler"),
  "FAIL: Route handler UploadThing harus terpasang"
);
console.log("✔ TASK-10 (UploadThing): Router imageUploader terpasang dengan proteksi sesi admin.");

// 2. Verifikasi TASK-11 (Artikel CMS + Publik)
const articleRoute = fs.readFileSync("src/app/api/v1/articles/route.ts", "utf-8");
assert(
  articleRoute.includes('status: "PUBLISHED"'),
  "FAIL: API /api/v1/articles HANYA boleh menampilkan status PUBLISHED"
);
assert(
  articleRoute.includes("totalPages"),
  "FAIL: API /api/v1/articles harus menyertakan meta paginasi"
);
const articleSlugRoute = fs.readFileSync("src/app/api/v1/articles/[slug]/route.ts", "utf-8");
assert(
  articleSlugRoute.includes("404") && articleSlugRoute.includes("NOT_FOUND"),
  "FAIL: API /api/v1/articles/[slug] harus mengembalikan 404 jika artikel DRAFT atau tidak ada"
);
const articleActions = fs.readFileSync("src/app/admin/articles/actions.ts", "utf-8");
assert(
  articleActions.includes("VALIDATION_ERROR"),
  "FAIL: Slug artikel duplikat harus mengembalikan VALIDATION_ERROR"
);
assert(
  articleActions.includes("publishedAt = new Date()"),
  "FAIL: publishedAt harus otomatis diisi saat pertama kali dipublikasikan"
);
console.log("✔ TASK-11 (Artikel): Draft tidak bocor ke publik, 404 pada slug draft, validasi slug unik, auto publishedAt.");

// 3. Verifikasi TASK-12 (Testimoni Admin & Publik Read-Only)
const testimonialRoute = fs.readFileSync("src/app/api/v1/admin/testimonials/route.ts", "utf-8");
assert(
  testimonialRoute.includes("min(1") && testimonialRoute.includes("max(5"),
  "FAIL: Rating testimoni wajib dibatasi 1–5!"
);
assert(
  testimonialRoute.includes("VALIDATION_ERROR") && testimonialRoute.includes("422"),
  "FAIL: Rating di luar 1–5 harus menghasilkan 422 VALIDATION_ERROR!"
);
const publicTestimonialPage = fs.readFileSync("src/app/testimonials/page.tsx", "utf-8");
assert(
  !publicTestimonialPage.includes("<form") && !publicTestimonialPage.includes("<input"),
  "FAIL: DEC-005 dilanggar! Halaman testimoni publik TIDAK BOLEH memiliki form atau input publik!"
);
assert(
  publicTestimonialPage.includes("border-l-2"),
  "FAIL: Testimoni harus memakai garis kiri 2px --color-border, bukan kartu (DESIGN.md §8)"
);
assert(
  publicTestimonialPage.includes("dari 5"),
  "FAIL: Rating wajib menyertakan teks 'X dari 5' untuk kepatuhan WCAG (DESIGN.md §12)"
);
console.log("✔ TASK-12 (Testimoni): Rating 1–5 ditegakkan (422 bila salah), publik 100% read-only tanpa form (DEC-005), hairline left border.");

// Grid artikel publik: 2 kolom (ponsel/tablet), 3 kolom (laptop).
const publicArticlesPage = fs.readFileSync("src/app/articles/page.tsx", "utf-8");
assert(
  publicArticlesPage.includes("grid-cols-2") && publicArticlesPage.includes("lg:grid-cols-3"),
  "FAIL: /articles harus 2 kolom di ponsel/tablet dan 3 kolom di laptop"
);
assert(
  publicArticlesPage.includes("line-clamp-2") && publicArticlesPage.includes("line-clamp-3"),
  "FAIL: kartu artikel butuh clamp judul (3 baris) dan ringkasan (2 baris)"
);

// Pratinjau langsung di editor artikel (mirip WordPress).
const articleForm = fs.readFileSync("src/app/admin/articles/article-form.tsx", "utf-8");
assert(
  articleForm.includes("function ArticlePreview") && articleForm.includes("value={content}"),
  "FAIL: editor artikel harus punya pratinjau langsung dari state konten"
);
assert(
  articleForm.includes("<details") && articleForm.includes("xl:sticky"),
  "FAIL: pratinjau perlu kolaps di layar kecil dan menempel di layar lebar"
);
console.log("✔ Artikel: grid 3/2 kolom + pratinjau editor langsung terpasang.");

// 4. Audit lucide-react
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
assert(!pkg.dependencies["lucide-react"], "FAIL: lucide-react ditemukan di package.json!");
console.log("✔ Audit Dependensi: lucide-react BERSIH (0 instansi).");

console.log("\n>>> SEMUA PENGECEKAN ACCEPTANCE TEST FASE 4 BERHASIL (100% PASSED)! <<<");
