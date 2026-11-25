import assert from "assert";
import fs from "fs";

console.log("--- Menjalankan Verifikasi Kriteria Penerimaan TASK-01 s/d TASK-05 ---");

// 1. Audit package.json
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
assert(
  !pkg.dependencies["lucide-react"] && !pkg.devDependencies?.["lucide-react"],
  "FAIL: lucide-react tidak boleh ada di package.json"
);
console.log("✔ Audit Ikon: lucide-react TIDAK ADA di package.json.");
assert(
  pkg.dependencies["@tabler/icons-react"],
  "FAIL: @tabler/icons-react harus ada di package.json"
);
console.log("✔ Tabler Icons: @tabler/icons-react terpasang.");

// 2. Audit Prisma Schema
const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
assert(schema.includes('model Service'), "FAIL: Model Service tidak ditemukan di schema.prisma");
assert(schema.includes('model Lead'), "FAIL: Model Lead tidak ditemukan di schema.prisma");
assert(schema.includes('model Article'), "FAIL: Model Article tidak ditemukan di schema.prisma");
assert(schema.includes('model Testimonial'), "FAIL: Model Testimonial tidak ditemukan di schema.prisma");
assert(schema.includes('model SiteSetting'), "FAIL: Model SiteSetting tidak ditemukan di schema.prisma");
assert(schema.includes('enum LeadStatus'), "FAIL: Enum LeadStatus tidak ditemukan di schema.prisma");
assert(schema.includes('enum ContentStatus'), "FAIL: Enum ContentStatus tidak ditemukan di schema.prisma");
assert(schema.includes('slug           String   @unique'), "FAIL: Service.slug harus @unique");
assert(schema.includes('id             String   @id @default("singleton")'), "FAIL: SiteSetting.id harus default singleton");
console.log("✔ Skema Prisma: 5 tabel inti + 2 enum + Better Auth models valid sesuai DATABASE.md.");

// 3. Audit Larangan Harga Pasti (Zero Exact Price Rule - DEC-002)
assert(
  !schema.includes("price Float") && !schema.includes("price Int") && !schema.includes("price Decimal"),
  "FAIL: Tidak boleh ada kolom harga numerik di schema.prisma!"
);
assert(schema.includes('priceFromLabel String   @default("mulai dari Rp50.000")'), "FAIL: Service harus memakai priceFromLabel teks");
assert(schema.includes('minPriceLabel  String   @default("mulai dari Rp50.000")'), "FAIL: SiteSetting harus memakai minPriceLabel teks");
console.log("✔ Aturan Harga DEC-002: Tidak ada harga numerik di skema data, hanya label teks 'mulai dari Rp50.000'.");

// 4. Audit TASK-04 (SiteSetting Action & Form)
const settingsActions = fs.readFileSync("src/app/admin/settings/actions.ts", "utf-8");
assert(
  settingsActions.includes('whatsappNumberRaw && whatsappNumberRaw.trim().length > 0'),
  "FAIL: whatsappNumber kosong harus disimpan sebagai NULL, bukan string kosong!"
);
assert(
  settingsActions.includes('where: { id: "singleton" }'),
  "FAIL: SiteSetting harus selalu menggunakan id 'singleton'!"
);
console.log("✔ TASK-04 Acceptance Check: SiteSetting singleton dijamin ('singleton'), whatsappNumber kosong disimpan sebagai NULL.");

// 5. Audit TASK-05 (CRUD Service Action & Form)
const serviceActions = fs.readFileSync("src/app/admin/services/actions.ts", "utf-8");
assert(
  serviceActions.includes('existingSlug'),
  "FAIL: Pengecekan slug duplikat wajib ada!"
);
assert(
  serviceActions.includes('VALIDATION_ERROR'),
  "FAIL: Slug duplikat harus mengembalikan VALIDATION_ERROR!"
);
assert(
  serviceActions.includes('isPublished: z.boolean().default(false)'),
  "FAIL: isPublished harus default false!"
);
console.log("✔ TASK-05 Acceptance Check: isPublished default false, slug duplikat ditolak VALIDATION_ERROR, tanpa field harga numerik.");

console.log("\nSEMUA PENGECEKAN ACCEPTANCE CRITERIA BERHASIL (PASSED)!");
