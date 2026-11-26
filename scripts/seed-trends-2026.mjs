import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

const ARTICLES = [
  {
    slug: "kernelsu-next-vs-apatch-vs-magisk-root-android",
    title: "KernelSU Next vs APatch vs Magisk: Mana Paling Aman untuk Root Android?",
    metaTitle: "KernelSU Next vs APatch vs Magisk untuk Root Android — TechFixSoftware",
    metaDescription:
      "Perbandingan jujur KernelSU Next, APatch, dan Magisk untuk root Android modern (GKI & non-GKI): cara kerja, risiko Play Integrity, dan cara memilih metode teraman.",
    content: `Memilih metode root Android sekarang tidak lagi terpaku pada Magisk. Untuk HP Android 12 ke atas berarsitektur GKI (Generic Kernel Image), KernelSU Next dan APatch sering menjadi pilihan lebih bersih karena bekerja di level kernel, sementara Magisk tetap menjadi opsi universal untuk perangkat lama. Pilihan terbaik bergantung pada tipe kernel, status bootloader, dan kebutuhan aplikasi harian Anda.

## Perbedaan Cara Kerja Ketiganya
Setiap metode menyuntikkan hak akses superuser pada lapisan sistem yang berbeda:
- Magisk bekerja di lapisan userspace/ramdisk (partisi boot atau init_boot). Kompatibel dengan hampir semua perangkat Android, tetapi jejak mount dan prosesnya lebih sering menjadi sasaran deteksi aplikasi sensitif.
- KernelSU dan KernelSU Next bekerja langsung di dalam ruang kernel Linux (khusus kernel GKI 5.10 ke atas atau kernel kustom yang dikompilasi ulang). Karena pemberian izin root berbasis daftar aplikasi yang diizinkan (whitelist), aplikasi lain tidak melihat biner su secara bawaan.
- APatch memakai teknologi KernelPatch dengan menambal file boot.img asli tanpa perlu mengganti kernel penuh. Mendukung modul kernel (KPM) sekaligus modul ala Magisk (APM), cocok untuk HP modern yang belum punya build KernelSU siap pakai.

## Kapan Sebaiknya Memilih Masing-Masing Metode?
### Pilih KernelSU Next jika
- Perangkat Anda memakai kernel GKI (umumnya Android 12–16 di Xiaomi HyperOS, Poco, Pixel, OnePlus, atau Infinix/Tecno keluaran baru).
- Anda menginginkan permukaan deteksi root yang paling minimal dan rapi.

### Pilih APatch jika
- Perangkat Anda memakai kernel GKI/modern tetapi belum tersedia prebuilt image KernelSU yang cocok dengan nomor build firmware Anda.
- Anda tetap membutuhkan kompatibilitas modul Magisk sambil memakai pendekatan kernel-level.

### Pilih Magisk jika
- Perangkat Anda masih memakai kernel non-GKI (Android 11 ke bawah atau beberapa chipset lawas).
- Anda hanya membutuhkan modul standar seperti pembersih bloatware, backup data, atau tweak audio.

## Risiko Play Integrity dan Aplikasi M-Banking
Apa pun metode root yang dipilih, membuka bootloader (UBL) secara otomatis menurunkan status integritas perangkat pada Google Play Integrity API. Modul tambahan seperti ZygiskNext, PlayIntegrityFork, atau SUSFS memang sering dipakai oleh komunitas, tetapi standar pemeriksaan Google dan aplikasi perbankan berubah sewaktu-waktu tanpa jaminan permanen. Jika Anda mengandalkan M-Banking atau aplikasi kerja yang ketat setiap hari, opsi paling aman tetap memisahkan perangkat harian dari perangkat oprek.

## Syarat Sebelum Root Remote
Sebelum proses root dimulai, teknisi selalu memeriksa tiga hal utama:
- Status Unlock Bootloader (UBL) perangkat sudah terbuka atau mendukung proses unlock resmi.
- Nomor build firmware aktif dicocokkan agar file boot.img atau init_boot.img orisinal dicadangkan terlebih dahulu sebagai proteksi anti-bootloop.
- Koneksi PC Windows, kabel USB data berkualitas baik, dan sesi remote AnyDesk/UltraViewer agar seluruh langkah bisa dipantau langsung di layar Anda.`,
  },
  {
    slug: "solusi-limit-kuota-ubl-unlock-bootloader-xiaomi-hyperos",
    title: "Solusi Gagal dan Limit Kuota Unlock Bootloader (UBL) Xiaomi HyperOS",
    metaTitle: "Cara Mengatasi Limit Kuota UBL Xiaomi HyperOS — TechFixSoftware",
    metaDescription:
      "Kenapa Unlock Bootloader (UBL) Xiaomi HyperOS sering terkena limit kuota harian atau Error 20091? Pahami syarat resmi, konsekuensi reset data, dan solusi penanganannya.",
    content: `Unlock Bootloader (UBL) pada Xiaomi, Redmi, dan Poco yang menjalankan HyperOS kini jauh lebih ketat dibanding era MIUI. Pengguna sering menemui pesan kuota harian habis di aplikasi Xiaomi Community atau Error 20091 saat mengikat akun di Opsi Pengembang. Memahami aturan resmi vendor dan urutan persiapan adalah kunci agar proses UBL tidak gagal berulang kali.

## Kenapa UBL HyperOS Sering Gagal?
Ada empat penyebab paling umum yang ditemui saat pengecekan perangkat HyperOS:
- Limit kuota izin harian di aplikasi Xiaomi Community yang cepat habis tepat pada pergantian waktu server Beijing (GMT+8).
- Akun Xiaomi berumur kurang dari 30 hari atau belum terverifikasi nomor HP aktif pada kartu SIM di perangkat.
- Perbedaan region ROM (misalnya perangkat versi China yang dipaksa memakai akun global, atau sebaliknya).
- Error 20091 / Account Not Bound karena sinkronisasi Find Device atau Mi Cloud belum aktif saat menekan tombol Add account and device.

## Hal Wajib Sebelum Mencoba UBL
### 1. Backup Seluruh Data Pribadi
Sesuai kebijakan keamanan Android Verified Boot (AVB), perintah unlock bootloader akan menghapus kunci enkripsi partisi userdata sehingga ponsel otomatis melakukan factory reset. Amankan seluruh foto, dokumen, dan chat WhatsApp ke PC atau cloud sebelum mulai.

### 2. Cek Driver dan Kabel USB
Gunakan PC/laptop Windows dengan driver Android Bootloader Interface terpasang rapi dan kabel USB data original (bukan kabel khusus pengisian daya). Port USB 2.0 di motherboard sering lebih stabil dibanding hub USB tambahan saat koneksi Fastboot.

### 3. Jangan Flash Paksa Saat Bootloader Terkunci
Mencoba flashing ROM lintas region (misalnya China ke Global) saat status bootloader masih terkunci bisa langsung memicu pesan The system has been destroyed atau hardbrick EDL 9008. Pastikan status bootloader benar-benar unlocked terlebih dahulu.

## Kapan Perlu Bantuan Teknisi Remote?
Jika Anda sudah mencoba mengikat akun berkali-kali tetapi tetap terhenti di error driver, fastboot tidak terbaca di Windows, atau bingung memastikan apakah varian HyperOS Anda mendukung UBL resmi, Anda bisa berkonsultasi dulu lewat WhatsApp. Teknisi TechFixSoftware akan mengecek varian model, region ROM, dan opsi penanganan paling aman sebelum biaya disepakati.`,
  },
  {
    slug: "cara-mengatasi-the-system-has-been-destroyed-xiaomi-poco",
    title: "Cara Mengatasi The System Has Been Destroyed dan EDL 9008 di Xiaomi & Poco",
    metaTitle: "Fix The System Has Been Destroyed & Unbrick EDL 9008 Xiaomi Poco — TechFixSoftware",
    metaDescription:
      "HP Xiaomi atau Poco muncul pesan The System Has Been Destroyed atau mati total terdeteksi Qualcomm 9008? Pelajari penyebab, cek respon PC, dan langkah pemulihan aman.",
    content: `Pesan The System Has Been Destroyed pada layar hitam Xiaomi, Redmi, atau Poco menandakan verifikasi tanda tangan partisi sistem gagal akibat salah flash firmware, downgrade yang melanggar Anti-Rollback (ARB), atau bootloader terkunci ulang setelah ganti ROM. Selama perangkat masih merespons di mode Fastboot atau port darurat Qualcomm HS-USB QDLoader 9008 / MediaTek BROM, peluang pemulihan lewat jalur software masih terbuka.

## Bedakan Dua Kondisi Respon Perangkat
Sebelum mengambil tindakan, colokkan HP ke PC Windows dengan kabel USB data dan perhatikan responnya:
- Masih bisa masuk Fastboot (tahan tombol Power + Volume Bawah): Ini tergolong soft brick ringan hingga menengah. Penanganan dilakukan dengan verifikasi status bootloader dan penulisan ulang firmware resmi yang sesuai region serta board ID.
- Layar gelap total, tetapi di Device Manager Windows terbaca Qualcomm HS-USB QDLoader 9008 atau MediaTek Preloader/BROM: Perangkat masuk mode darurat pabrikan (hardbrick software). Pemulihan membutuhkan file programmer (firehose/DA) serta firmware resmi yang cocok.
- Sama sekali tidak ada respon suara connect USB di Windows dan arus pengisian 0 ampere: Besar kemungkinan ada kendala hardware fisik (baterai drop parah, IC power, atau chip memori eMMC/UFS rusak) yang perlu pemeriksaan langsung di konter hardware.

## Kesalahan yang Sering Memperparah Kondisi
- Mencoba file firmware acak dari internet tanpa mencocokkan codename perangkat dan region (ID, Global, EEA, China).
- Mengunci ulang bootloader (Clean all and lock di Mi Flash) saat memasang ROM Global pada unit Xiaomi versi China — ini penyebab paling sering munculnya layar The System Has Been Destroyed.
- Memutus kabel USB di tengah proses flashing partisi bootloader primer.

## Persiapan Sebelum Unbrick Remote
Jika perangkat Anda masih terdeteksi di PC Windows, siapkan kelengkapan berikut agar proses diagnosa remote berjalan cepat:
- PC atau laptop Windows 10/11 dengan koneksi internet stabil untuk mengunduh firmware resmi.
- Kabel USB data yang tidak longgar.
- Kronologi singkat: apakah kejadian muncul setelah update OTA, gagal root, ganti custom ROM, atau salah pilih opsi di Mi Flash.

TechFixSoftware mengecek respon driver dan port perangkat Anda secara transparan lewat sesi remote AnyDesk atau UltraViewer sebelum menyepakati biaya dan memulai eksekusi pemulihan.`,
  },
];

async function main() {
  const now = new Date();
  for (const item of ARTICLES) {
    const saved = await prisma.article.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content: item.content,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        status: "PUBLISHED",
      },
      create: {
        slug: item.slug,
        title: item.title,
        content: item.content,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        status: "PUBLISHED",
        publishedAt: now,
      },
    });
    console.log(`Seeded article: /articles/${saved.slug}`);
  }
}

main()
  .catch((err) => {
    console.error("Failed seeding trend articles:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
