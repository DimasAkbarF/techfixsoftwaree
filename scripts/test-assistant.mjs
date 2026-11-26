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
      name: "Root Android",
      slug: "root-android",
      category: "System Modification",
      description:
        "Layanan root systemless Magisk dan KernelSU.\n\n## Pertanyaan Umum\n### Apakah HP yang di-root masih bisa membuka aplikasi M-Banking?\nTidak ada jaminan. Aplikasi perbankan dapat menolak dibuka di HP yang sudah di-root.",
      symptoms: ["Ingin hapus bloatware", "Root Magisk"],
      priceFromLabel: "mulai dari Rp50.000",
    },
    {
      name: "Fix Bootloop & Stuck Logo",
      slug: "fix-bootloop",
      category: "Perbaikan",
      description: "Penanganan HP Android yang restart terus-menerus atau berhenti di logo merek.",
      symptoms: ["Stuck logo", "Bootloop setelah update"],
      priceFromLabel: "mulai dari Rp50.000",
    },
    {
      name: "Unbrick Android (Hardbrick EDL 9008)",
      slug: "unbrick-android",
      category: "Perbaikan",
      description: "Pemulihan HP mati total akibat salah flash lewat mode EDL 9008 atau Fastboot.",
      symptoms: ["Mati total", "Terdeteksi 9008"],
      priceFromLabel: "mulai dari Rp75.000",
    },
  ],
  articles: [
    {
      title: "Apa Itu Partisi A/B dan Dynamic Partitions Android",
      slug: "apa-itu-partisi-a-b-dan-dynamic-partitions-android",
      content: "Penjelasan partisi A/B dan dynamic partitions pada perangkat Android modern.",
      metaDescription: "Memahami cara kerja partisi A/B dan dynamic partitions Android.",
    },
  ],
  roms: [
    { name: "LineageOS" },
    { name: "PixelOS" },
  ],
  siteSetting: {
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

// 3. Typo tolerance ("botlop")
const rTypo = replyFromKnowledge("hp saya botlop terus", knowledge);
assert.ok(rTypo.links?.some((l) => l.href === "/services/fix-bootloop"));

// 4. Pricing intent
const rPrice = replyFromKnowledge("biaya servis mulai berapa?", knowledge);
assert.ok(rPrice.messages[0].includes("mulai dari Rp50.000"));

// 5. Remote flow intent
const rRemote = replyFromKnowledge("cara servis remote gimana?", knowledge);
assert.ok(rRemote.links?.some((l) => l.href === "/cara-kerja"));

// 6. Custom ROM list intent
const rRom = replyFromKnowledge("daftar custom rom apa saja?", knowledge);
assert.ok(rRom.messages[0].includes("LineageOS"));
assert.ok(rRom.messages[0].includes("PixelOS"));

// 7. Article match intent
const rArticle = replyFromKnowledge("apa itu partisi a/b dynamic partitions?", knowledge);
assert.ok(
  rArticle.links?.some((l) => l.href === "/articles/apa-itu-partisi-a-b-dan-dynamic-partitions-android")
);

// 8. Extracted FAQ from service description
const rFaq = replyFromKnowledge("apakah hp root masih bisa membuka aplikasi m-banking?", knowledge);
assert.ok(rFaq.messages[0].toLowerCase().includes("tidak ada jaminan"));

// 9. iOS clarification
const rIos = replyFromKnowledge("bisa servis iphone?", knowledge);
assert.ok(rIos.messages[0].toLowerCase().includes("belum melayani iphone"));

// 10. Hardware clarification (LCD pecah)
const rHw = replyFromKnowledge("bisa ganti lcd pecah gak?", knowledge);
assert.ok(rHw.messages[0].toLowerCase().includes("tidak melayani penggantian sparepart"));

// 11. Payment methods (QRIS)
const rPay = replyFromKnowledge("pembayaran pakai qris bisa?", knowledge);
assert.ok(rPay.messages[0].includes("QRIS"));

// 12. Data safety / backup
const rData = replyFromKnowledge("apakah data foto hilang saat servis?", knowledge);
assert.ok(rData.messages[0].toLowerCase().includes("data"));

// 13. Thanks / closing
const rThanks = replyFromKnowledge("makasih min", knowledge);
assert.ok(rThanks.messages[0].toLowerCase().includes("sama-sama"));

// 14. Confused natural fallback for out-of-scope question
const rConfused = replyFromKnowledge("resep nasi goreng enak dong", knowledge);
assert.ok(/(bingung|garuk|nge-lag)/i.test(rConfused.messages[0]));
assert.ok(rConfused.whatsappUrl?.startsWith("https://wa.me/6281234567890?text="));

// 15. Fallback when WhatsApp number is not configured
const rNoWa = replyFromKnowledge("siapa presiden planet mars?", {
  ...knowledge,
  siteSetting: { ...knowledge.siteSetting, whatsappNumber: null },
});
assert.equal(rNoWa.whatsappUrl, undefined);
assert.ok(rNoWa.links?.some((l) => l.href === "/#konsultasi"));

rmSync(outDir, { recursive: true, force: true });
console.log("ALL 15 ASSISTANT TESTS PASSED");
