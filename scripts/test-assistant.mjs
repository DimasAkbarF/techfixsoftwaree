import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";

const outDir = "/tmp/tfs-assistant-test";
rmSync(outDir, { recursive: true, force: true });

execFileSync(
  "npx",
  [
    "tsc",
    "src/lib/assistant.ts",
    "--outDir",
    outDir,
    "--module",
    "commonjs",
    "--target",
    "es2022",
    "--esModuleInterop",
    "--skipLibCheck",
  ],
  { stdio: "inherit" }
);

const require = createRequire(import.meta.url);
const { replyFromKnowledge } = require(`${outDir}/assistant.js`);

const knowledge = {
  services: [
    {
      id: "1",
      name: "Fix Bootloop & Stuck Logo",
      slug: "fix-bootloop",
      category: "Perbaikan",
      description: "Penanganan HP Android yang restart terus-menerus atau berhenti di logo merek.",
      symptoms: ["Stuck logo", "Bootloop setelah update"],
      preparation: ["Kabel USB"],
      priceFromLabel: "mulai dari Rp50.000",
      icon: null,
      sortOrder: 1,
      updatedAt: "2026-11-26",
    },
    {
      id: "2",
      name: "Unbrick Android (Hardbrick EDL 9008)",
      slug: "unbrick-android",
      category: "Perbaikan",
      description: "Pemulihan HP mati total akibat salah flash lewat mode EDL 9008 atau Fastboot.",
      symptoms: ["Mati total", "Terdeteksi 9008"],
      preparation: ["PC Windows", "Kabel USB"],
      priceFromLabel: "mulai dari Rp75.000",
      icon: null,
      sortOrder: 2,
      updatedAt: "2026-11-26",
    },
  ],
  articles: [
    {
      id: "a1",
      title: "Kenapa Aplikasi M-Banking Terdeteksi Root",
      slug: "kenapa-aplikasi-m-banking-terdeteksi-root",
      content: "Penjelasan Play Integrity dan deteksi Zygisk pada aplikasi perbankan.",
      coverImageUrl: null,
      metaTitle: null,
      metaDescription: "Cara kerja Play Integrity dan solusi m-banking terdeteksi root.",
      publishedAt: "2026-11-20",
      updatedAt: "2026-11-20",
    },
  ],
  roms: [
    { name: "LineageOS", logoUrl: "/roms/lineageos.png" },
    { name: "PixelOS", logoUrl: "/roms/pixelos.png" },
  ],
  siteSetting: {
    brandName: "TechFixSoftware",
    logoUrl: null,
    whatsappNumber: "081234567890",
    minPriceLabel: "mulai dari Rp50.000",
  },
};

// 1. Greeting
const rGreeting = replyFromKnowledge("Halo", knowledge);
assert.ok(rGreeting.messages[0].includes("TechFixSoftware"));
assert.ok(rGreeting.suggestions?.length >= 3);

// 2. Service match with slang ("matot") + WA URL normalization (08 -> 62)
const rMatot = replyFromKnowledge("hp poco saya matot abis flash", knowledge);
assert.ok(rMatot.links?.some((l) => l.href === "/services/unbrick-android"));
assert.ok(rMatot.whatsappUrl?.startsWith("https://wa.me/6281234567890?text="));

// 3. Pricing intent
const rPrice = replyFromKnowledge("biaya servis mulai berapa?", knowledge);
assert.ok(rPrice.messages[0].includes("mulai dari Rp50.000"));

// 4. Remote flow intent
const rRemote = replyFromKnowledge("cara servis remote gimana?", knowledge);
assert.ok(rRemote.links?.some((l) => l.href === "/cara-kerja"));

// 5. Custom ROM list intent
const rRom = replyFromKnowledge("daftar custom rom apa saja?", knowledge);
assert.ok(rRom.messages[0].includes("LineageOS"));
assert.ok(rRom.messages[0].includes("PixelOS"));

// 6. Article match intent
const rArticle = replyFromKnowledge("kenapa m-banking terdeteksi root?", knowledge);
assert.ok(
  rArticle.links?.some((l) => l.href === "/articles/kenapa-aplikasi-m-banking-terdeteksi-root")
);

// 7. iOS clarification
const rIos = replyFromKnowledge("bisa servis iphone?", knowledge);
assert.ok(rIos.messages[0].toLowerCase().includes("belum melayani iphone"));

// 8. Fallback when WhatsApp number is not configured
const rNoWa = replyFromKnowledge("pertanyaan acak xyz", {
  ...knowledge,
  siteSetting: { ...knowledge.siteSetting, whatsappNumber: null },
});
assert.equal(rNoWa.whatsappUrl, undefined);
assert.ok(rNoWa.links?.some((l) => l.href === "/#konsultasi"));

rmSync(outDir, { recursive: true, force: true });
console.log("ALL 8 ASSISTANT TESTS PASSED");
