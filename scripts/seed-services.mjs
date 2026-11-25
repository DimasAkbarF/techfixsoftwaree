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

const PRICE = "mulai dari Rp50.000";

// Sumber: katalog dan halaman detail TechFix Software (situs lama TechFixSoftware).
const services = [
  {
    slug: "root-android",
    name: "Root Android",
    category: "System Modification",
    icon: "IconBrandAndroid",
    sortOrder: 1,
    description:
      "Root systemless dengan Magisk, KernelSU, atau APatch untuk debloat, backup menyeluruh, dan modul kustomisasi. Dikerjakan remote dengan pendampingan teknisi.",
    symptoms: [
      "Ingin memasang modul kustomisasi sistem dengan pendampingan teknisi.",
      "Aplikasi bawaan pabrik dan iklan sistem membuat HP lambat dan memori penuh.",
      "Butuh backup penuh data aplikasi dan progres game sebelum ganti perangkat.",
      "Perangkat bootloop atau stuck logo setelah gagal memasang Magisk atau modul root.",
    ],
    preparation: [
      "PC atau laptop Windows dengan koneksi internet stabil.",
      "Kabel data USB original yang mendukung transfer data.",
      "Baterai ponsel terisi minimal 50%.",
      "AnyDesk terpasang di PC atau laptop untuk sesi remote.",
      "Cadangkan data penting jika bootloader perangkat belum di-unlock.",
    ],
  },
  {
    slug: "unlock-bootloader",
    name: "Unlock Bootloader",
    category: "System Modification",
    icon: "IconShieldCheck",
    sortOrder: 2,
    description:
      "Asistensi unlock bootloader pada perangkat yang mendukung, termasuk penjelasan risiko dan konsekuensinya sebelum proses dijalankan.",
    symptoms: [
      "Bootloader masih terkunci sehingga perangkat menolak custom boot image.",
      "Gagal saat mencoba unlock bootloader sendiri lewat fastboot.",
      "Butuh panduan pengikatan akun vendor, misalnya Mi Account, untuk izin unlock.",
    ],
    preparation: [
      "Kabel USB berkualitas dan PC atau laptop Windows.",
      "Koneksi internet stabil.",
      "Baterai terisi minimal 50%.",
      "Cadangan data internal karena proses unlock menghapus seluruh data.",
    ],
  },
  {
    slug: "fix-bootloop",
    name: "Fix Bootloop",
    category: "Repair & Pemulihan",
    icon: "IconRefreshAlert",
    sortOrder: 3,
    description:
      "Penilaian penyebab dan upaya pemulihan perangkat yang stuck di logo, restart berulang, atau gagal masuk ke sistem.",
    symptoms: [
      "HP berhenti di logo merek dan tidak pernah masuk ke layar kunci.",
      "Perangkat restart terus-menerus setiap beberapa detik atau menit.",
      "Ponsel mendadak mati dan hanya menampilkan logo setelah update sistem.",
      "HP masuk ke recovery bawaan dan menampilkan error sistem.",
    ],
    preparation: [
      "Kabel USB dan PC atau laptop dengan internet stabil.",
      "Baterai perangkat terisi; hubungkan ke charger bila perlu.",
      "Informasi kronologi: kapan masalah mulai dan aktivitas terakhir.",
      "Pahami bahwa pemulihan memprioritaskan sistem operasi; data bisa hilang tergantung kerusakan.",
    ],
  },
  {
    slug: "unbrick",
    name: "Unbrick / Pemulihan Soft Brick",
    category: "Repair & Pemulihan",
    icon: "IconFlame",
    sortOrder: 4,
    description:
      "Asesmen dan upaya pemulihan perangkat yang tidak bisa digunakan karena kegagalan software, termasuk soft brick setelah flashing.",
    symptoms: [
      "HP layar hitam pekat atau hanya bergetar sesaat setelah salah flash.",
      "Perangkat terdeteksi di komputer sebagai port darurat (EDL 9008, BROM, VCOM, atau Download Mode).",
      "Lampu notifikasi berkedip tetapi layar tidak menampilkan gambar.",
    ],
    preparation: [
      "Kabel USB original dan PC atau laptop Windows.",
      "Koneksi internet stabil untuk mengunduh firmware resmi.",
      "Riwayat detail: file apa yang terakhir diflash ke perangkat.",
      "Varian model persis, misalnya chipset MediaTek atau Snapdragon.",
    ],
  },
  {
    slug: "flash-firmware",
    name: "Flash Firmware",
    category: "Firmware Stock",
    icon: "IconCpu",
    sortOrder: 5,
    description:
      "Instalasi firmware stock, restore firmware, serta asistensi upgrade atau downgrade versi yang didukung perangkat.",
    symptoms: [
      "Sistem Android lambat, lag ekstrem, atau terinfeksi iklan yang tidak bisa di-uninstall.",
      "Ingin kembali ke versi OS resmi setelah mencoba custom ROM.",
      "Pembaruan sistem resmi gagal terinstal atau meninggalkan bug.",
      "Ingin downgrade versi Android yang masih didukung anti-rollback.",
    ],
    preparation: [
      "Kabel USB dan PC atau laptop dengan internet stabil.",
      "Baterai minimal 50%.",
      "Cadangan data penting jika perangkat masih bisa diakses.",
      "Nomor model lengkap perangkat.",
    ],
  },
  {
    slug: "custom-rom",
    name: "Custom ROM",
    category: "Customization",
    icon: "IconDeviceMobile",
    sortOrder: 6,
    description:
      "Asistensi pemilihan, instalasi, migrasi, dan troubleshooting custom ROM pada perangkat yang kompatibel.",
    symptoms: [
      "HP terasa berat karena antarmuka pabrikan penuh bloatware dan iklan sistem.",
      "Versi Android resmi mentok di versi lama padahal ingin fitur terbaru.",
      "Mengalami bootloop setelah mencoba memasang ROM secara mandiri.",
    ],
    preparation: [
      "Kabel USB dan PC atau laptop dengan internet stabil.",
      "Baterai terisi penuh.",
      "Cadangan data penting di luar ponsel karena instalasi ROM menghapus data internal.",
      "Bootloader perangkat sudah terbuka (unlocked).",
    ],
  },
  {
    slug: "recovery",
    name: "Recovery / Custom Recovery",
    category: "Customization",
    icon: "IconHistory",
    sortOrder: 7,
    description:
      "Setup recovery yang didukung, penjelasan mode recovery, dan troubleshooting perangkat yang terjebak di recovery.",
    symptoms: [
      "Setiap kali HP dinyalakan, selalu masuk ke mode recovery secara otomatis.",
      "Ingin memasang TWRP atau OrangeFox untuk persiapan flashing ROM atau Magisk.",
      "Penyimpanan di recovery terbaca terenkripsi (0 MB) dan tidak bisa membaca file zip.",
    ],
    preparation: [
      "Kabel USB dan PC atau laptop.",
      "Baterai terisi cukup.",
      "Informasi model dan kondisi perangkat saat ini.",
      "Bootloader sudah terbuka bila ingin memasang custom recovery.",
    ],
  },
  {
    slug: "software-repair",
    name: "Software Repair",
    category: "Repair & Pemulihan",
    icon: "IconTool",
    sortOrder: 8,
    description:
      "Diagnosis dan perbaikan error software, update gagal, ketidakstabilan sistem, dan troubleshooting software lainnya.",
    symptoms: [
      "Aplikasi sistem atau antarmuka terus memunculkan pesan 'Telah Berhenti'.",
      "Perangkat panas berlebih dan baterai boros karena proses sistem crash berulang.",
      "Muncul notifikasi error setelah pembaruan keamanan berkala.",
    ],
    preparation: [
      "Kabel USB dan PC atau laptop bila diperlukan tindakan mendalam.",
      "Baterai terisi minimal 40%.",
      "Cadangan data penting bila perangkat masih dapat dioperasikan.",
      "Catatan kronologi kemunculan error.",
    ],
  },
];

async function main() {
  const results = await Promise.all(
    services.map((service) =>
      prisma.service.upsert({
        where: { slug: service.slug },
        update: { ...service, priceFromLabel: PRICE, isPublished: true },
        create: { ...service, priceFromLabel: PRICE, isPublished: true },
      })
    )
  );

  console.log(`Berhasil menyimpan ${results.length} layanan.`);
  for (const service of results) {
    console.log(`- ${service.slug} (${service.category})`);
  }
}

main()
  .catch((error) => {
    console.error("Gagal menyimpan layanan:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
