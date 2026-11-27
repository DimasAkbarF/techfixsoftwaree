export interface BrandProfile {
  slug: string;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  summaryQuestion: string;
  summaryAnswer: string;
  popularModels: string[];
  commonIssues: Array<{ title: string; detail: string }>;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const BRAND_PROFILES: BrandProfile[] = [
  {
    slug: "xiaomi-poco",
    name: "Xiaomi, Redmi & POCO",
    shortName: "Xiaomi / POCO",
    metaTitle: "Jasa Servis Software Xiaomi, Redmi & POCO — UBL, Unbrick EDL & Custom ROM",
    metaDescription:
      "Layanan servis software khusus Xiaomi, Redmi, dan POCO: unbrick EDL 9008, stuck Fastboot, The system has been destroyed, HyperOS/MIUI flashing, UBL, Root Magisk/KernelSU, dan Custom ROM.",
    heroSubtitle:
      "Penanganan bootloop, stuck Fastboot, hardbrick EDL 9008, UBL HyperOS/MIUI, hingga instalasi Custom ROM & Root secara remote atau tatap muka.",
    summaryQuestion: "Apa saja masalah software Xiaomi, Redmi & POCO yang bisa ditangani?",
    summaryAnswer:
      "TechFixSoftware menangani berbagai kerusakan software Xiaomi, Redmi, dan POCO mulai dari bootloop, stuck logo HyperOS/MIUI, peringatan The system has been destroyed, hardbrick Qualcomm EDL 9008, hingga permintaan Unlock Bootloader, Root Magisk atau KernelSU, dan pemasangan Custom ROM secara remote via AnyDesk maupun langsung.",
    popularModels: [
      "POCO X3 Pro / X6 Pro / F5 / F6",
      "Redmi Note 10 / 11 / 12 / 13 Series",
      "Xiaomi 11T / 12T / 13T / 14 Series",
      "Redmi 9 / 10 / 12 / 13C",
    ],
    commonIssues: [
      {
        title: "Stuck Fastboot & The System Has Been Destroyed",
        detail: "Umum terjadi setelah gagal update MIUI/HyperOS atau salah flash partisi boot/vbmeta. Ditangani via flashing firmware resmi sesuai region.",
      },
      {
        title: "Hardbrick Qualcomm EDL 9008 / MediaTek BROM",
        detail: "Perangkat mati total, layar gelap, tetapi masih terbaca di Device Manager PC. Memerlukan penanganan firmware resmi dan metode auth yang sesuai.",
      },
      {
        title: "Unlock Bootloader, Root & Custom ROM",
        detail: "Instalasi TWRP/OrangeFox, Root Magisk/KernelSU, serta Custom ROM bersih seperti PixelOS, crDroid, LineageOS, atau Xiaomi.eu.",
      },
    ],
    keywords: ["xiaomi", "redmi", "poco", "miui", "hyperos", "edl", "9008", "fastboot", "ubl", "custom rom", "root"],
    faqs: [
      {
        question: "Apakah Xiaomi yang terkena The system has been destroyed masih bisa diperbaiki?",
        answer: "Bisa. Selama IC eMMC/UFS masih sehat, kerusakan ini umumnya disebabkan partisi sistem korup atau bootloader terkunci dengan ROM tidak resmi, dan dapat dipulihkan dengan flashing ulang.",
      },
      {
        question: "Apakah servis software Xiaomi/POCO bisa dikerjakan dari jarak jauh?",
        answer: "Bisa untuk sebagian besar kasus seperti flashing Fastboot, Root, TWRP, dan Custom ROM selama Anda memiliki PC/laptop Windows dan kabel USB yang stabil.",
      },
      {
        question: "Berapa biaya servis software Xiaomi & POCO di TechFixSoftware?",
        answer: "Biaya mulai dari Rp50.000 tergantung tipe perangkat dan tingkat kesulitan kasus. Estimasi final selalu disepakati terlebih dahulu via WhatsApp sebelum pengerjaan dimulai.",
      },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung Galaxy",
    shortName: "Samsung",
    metaTitle: "Jasa Servis Software Samsung Galaxy — Flash Odin, Bootloop & FRP",
    metaDescription:
      "Servis software khusus Samsung Galaxy: flashing firmware resmi 4-file via Odin, atasi bootloop/stuck logo, pindah region CSC XID, Root Magisk, dan penanganan FRP.",
    heroSubtitle:
      "Flashing firmware resmi Samsung 4-file (Odin), perbaikan bootloop setelah update One UI, pindah CSC Indonesia, hingga Root untuk perangkat Galaxy.",
    summaryQuestion: "Bagaimana penanganan servis software Samsung Galaxy di TechFixSoftware?",
    summaryAnswer:
      "Kami menggunakan firmware resmi Samsung 4-file (BL, AP, CP, CSC) melalui protokol Odin untuk mengatasi bootloop, gagal update One UI, atau error sistem tanpa merusak partisi EFS. Kami juga melayani ubah region CSC Indonesia (XID), bypass akun Google/FRP pemilik sah, dan Root Magisk sesuai kompatibilitas seri.",
    popularModels: [
      "Galaxy A14 / A24 / A34 / A54 / A55",
      "Galaxy S20 / S21 / S22 / S23 / S24 Series",
      "Galaxy M14 / M34 / M54",
      "Galaxy Tab A & Tab S Series",
    ],
    commonIssues: [
      {
        title: "Bootloop / Stuck Logo One UI",
        detail: "Terjadi pasca pembaruan OTA atau penyimpanan penuh. Flashing HOME_CSC memungkinkan penyelamatan data pada kondisi tertentu.",
      },
      {
        title: "Error Download Mode & Flashing Odin 4-File",
        detail: "Mengembalikan sistem ke kondisi pabrik stabil dengan binary (SW REV) yang cocok agar tidak gagal flash.",
      },
      {
        title: "Verifikasi Akun Google (FRP) & Ubah Region CSC",
        detail: "Bantuan pemulihan akses bagi pemilik perangkat yang lupa akun setelah reset pabrik, serta penyesuaian CSC Indonesia.",
      },
    ],
    keywords: ["samsung", "galaxy", "odin", "one ui", "knox", "bootloop", "firmware", "frp", "flash"],
    faqs: [
      {
        question: "Apakah flashing Samsung via Odin selalu menghapus data?",
        answer: "Tergantung kondisi sistem. Jika partisi userdata masih sehat, kami dapat mencoba opsi HOME_CSC untuk mempertahankan data, namun untuk kasus berat flashing bersih (CSC) lebih disarankan.",
      },
      {
        question: "Apakah Root pada Samsung memengaruhi Knox?",
        answer: "Ya, membuka bootloader dan melakukan Root pada perangkat Samsung akan memicu Knox Warranty Void secara permanen. Kami selalu menjelaskan konsekuensi ini sebelum tindakan dilakukan.",
      },
      {
        question: "Berapa biaya flashing atau perbaikan software Samsung?",
        answer: "Biaya mulai dari Rp50.000. Kirim tipe model (mis. SM-A546E) dan gejala lewat WhatsApp untuk estimasi yang jelas.",
      },
    ],
  },
  {
    slug: "infinix-tecno",
    name: "Infinix, Tecno & itel",
    shortName: "Infinix / Tecno",
    metaTitle: "Jasa Servis Software Infinix, Tecno & itel — Bootloop, Unbrick BROM & Root",
    metaDescription:
      "Layanan servis software Android khusus Infinix, Tecno, dan itel (Transsion): perbaiki bootloop XOS/HiOS, unbrick MediaTek BROM, flashing stock ROM, dan Root Magisk.",
    heroSubtitle:
      "Perbaikan bootloop XOS/HiOS, unbrick chipset MediaTek (BROM/Preloader), flashing firmware resmi, dan Root Magisk untuk lini Transsion.",
    summaryQuestion: "Apa saja kendala software Infinix, Tecno, dan itel yang sering kami tangani?",
    summaryAnswer:
      "Perangkat Infinix, Tecno, dan itel berbasis chipset MediaTek maupun Unisoc sering mengalami bootloop setelah update XOS/HiOS, mati total di mode BROM/Preloader, atau terkunci verifikasi akun Google setelah reset. TechFixSoftware menyediakan flashing firmware resmi, unbrick MediaTek, dan Root Magisk dengan panduan remote yang aman.",
    popularModels: [
      "Infinix Note 30 / Note 40 / GT 20 Pro",
      "Infinix Hot 30 / Hot 40 / Smart Series",
      "Tecno Pova 5 / Pova 6 / Camon 20 / Spark",
      "itel S23 / RS4 / P55",
    ],
    commonIssues: [
      {
        title: "Bootloop / Red State / Orange State",
        detail: "Muncul peringatan verifikasi boot atau restart berulang di logo Infinix/Tecno setelah modifikasi atau update sistem.",
      },
      {
        title: "Unbrick MediaTek BROM & Flashing Stock ROM",
        detail: "Pemulihan perangkat yang tidak mau menyala normal dengan mencocokkan build number firmware agar layar dan sinyal tetap normal.",
      },
      {
        title: "Root Magisk & Optimasi Sistem",
        detail: "Patch boot/init_boot resmi sesuai versi XOS/HiOS untuk akses root yang stabil tanpa merusak partisi NVRAM/IMEI.",
      },
    ],
    keywords: ["infinix", "tecno", "itel", "mediatek", "brom", "bootloop", "unbrick", "root", "firmware"],
    faqs: [
      {
        question: "Kenapa flashing Infinix/Tecno harus sesuai build number?",
        answer: "Firmware Transsion memiliki variasi driver layar dan kamera antar sub-versi build. Mencocokkan build number mencegah error layar blank atau kamera tidak berfungsi setelah flash.",
      },
      {
        question: "Apakah bisa servis remote untuk Infinix atau Tecno yang bootloop?",
        answer: "Bisa, selama Anda memiliki PC/laptop Windows dan kabel USB data yang baik. Teknisi akan memandu instalasi driver MediaTek dan prosesnya via AnyDesk.",
      },
      {
        question: "Berapa kisaran biaya servis software Infinix dan Tecno?",
        answer: "Mulai dari Rp50.000, bergantung pada jenis kerusakan dan kebutuhan firmware/auth perangkat Anda.",
      },
    ],
  },
  {
    slug: "realme-oppo",
    name: "Realme & OPPO",
    shortName: "Realme / OPPO",
    metaTitle: "Jasa Servis Software Realme & OPPO — Bootloop, Unbrick & Flashing",
    metaDescription:
      "Servis software khusus Realme dan OPPO: atasi bootloop ColorOS/Realme UI, stuck Recovery, unbrick MediaTek/Qualcomm, hingga UBL & Custom ROM pada seri yang mendukung.",
    heroSubtitle:
      "Solusi bootloop Realme UI & ColorOS, stuck Recovery Mode, flashing firmware resmi, dan oprek software untuk seri yang mendukung UBL.",
    summaryQuestion: "Layanan software apa yang tersedia untuk perangkat Realme dan OPPO?",
    summaryAnswer:
      "TechFixSoftware membantu pemulihan perangkat Realme dan OPPO yang mengalami bootloop, terjebak di layar Recovery Mode, error sistem pasca update ColorOS/Realme UI, hingga unbrick MediaTek atau Qualcomm. Untuk seri Realme tertentu yang mendukung Deep Testing, kami juga melayani Unlock Bootloader, Root, dan Custom ROM.",
    popularModels: [
      "Realme Narzo / C Series / Number Series (9, 10, 11, 12)",
      "Realme GT Neo / GT Master Edition",
      "OPPO A Series (A17, A57, A58, A78)",
      "OPPO Reno Series",
    ],
    commonIssues: [
      {
        title: "Stuck Recovery Mode / Bootloop ColorOS & Realme UI",
        detail: "HP terus kembali ke menu Recovery atau restart di logo. Ditangani lewat flashing firmware resmi sesuai kode model CPH/RMX.",
      },
      {
        title: "Unbrick & Pemulihan Partisi Sistem",
        detail: "Penanganan perangkat gagal flash agar kembali menyala normal tanpa kehilangan identitas IMEI.",
      },
      {
        title: "UBL Deep Testing, Root & Custom ROM (Seri Tertentu)",
        detail: "Khusus seri Realme yang mendukung unlock bootloader, tersedia layanan TWRP, Magisk/KernelSU, dan Custom ROM.",
      },
    ],
    keywords: ["realme", "oppo", "coloros", "bootloop", "recovery", "unbrick", "firmware", "root", "custom rom"],
    faqs: [
      {
        question: "Apakah semua HP OPPO dan Realme bisa di-Unlock Bootloader dan di-Root?",
        answer: "Tidak semua. Sebagian besar OPPO seri terbaru mengunci bootloader secara ketat, sementara beberapa seri Realme masih mendukung Deep Testing. Konsultasikan kode model (RMX/CPH) Anda terlebih dahulu agar kami cek.",
      },
      {
        question: "Apakah Realme yang stuck di Recovery Mode bisa diselamatkan datanya?",
        answer: "Kami akan memeriksa penyebabnya terlebih dahulu. Jika disebabkan korup sistem ringan, pemulihan tanpa wipe bisa dicoba, namun pada kerusakan partisi berat reset pabrik sering kali tidak terhindarkan.",
      },
      {
        question: "Berapa biaya perbaikan software Realme dan OPPO?",
        answer: "Biaya mulai dari Rp50.000 dengan estimasi final yang disepakati di WhatsApp sebelum eksekusi.",
      },
    ],
  },
  {
    slug: "google-pixel",
    name: "Google Pixel",
    shortName: "Google Pixel",
    metaTitle: "Jasa Servis Software Google Pixel — Root, Custom ROM, Unbrick & Flash",
    metaDescription:
      "Servis software khusus Google Pixel: flashing Factory Image, atasi bootloop/softbrick, Root Magisk/KernelSU, pengaturan Play Integrity, dan instalasi GrapheneOS/LineageOS.",
    heroSubtitle:
      "Flashing Factory Image resmi Google, perbaikan bootloop, Root Magisk/KernelSU, serta pemasangan GrapheneOS, LineageOS, atau Custom ROM lainnya.",
    summaryQuestion: "Apa layanan software khusus Google Pixel di TechFixSoftware?",
    summaryAnswer:
      "Kami melayani flashing Factory Image dan OTA resmi Google Pixel, perbaikan bootloop akibat gagal update Android atau modul Magisk bermasalah, Unlock Bootloader (non-Verizon/OEM unlocked), Root Magisk atau KernelSU dengan penyesuaian Play Integrity, serta pemasangan ROM fokus privasi seperti GrapheneOS dan LineageOS.",
    popularModels: [
      "Google Pixel 4a / 5 / 5a",
      "Google Pixel 6 / 6a / 6 Pro",
      "Google Pixel 7 / 7a / 7 Pro",
      "Google Pixel 8 / 8a / 8 Pro / 9 Series",
    ],
    commonIssues: [
      {
        title: "Bootloop Pasca Update Android atau Modul Root",
        detail: "Perbaikan cepat tanpa menghapus data (jika memungkinkan) dengan menonaktifkan modul bermasalah atau re-flash partisi boot/init_boot.",
      },
      {
        title: "Root Magisk / KernelSU & Konfigurasi Modul",
        detail: "Pemasangan root bersih sesuai versi build Android Pixel Anda, termasuk panduan keamanan dasar aplikasi perbankan.",
      },
      {
        title: "Instalasi GrapheneOS, LineageOS & Custom ROM",
        detail: "Pemasangan OS alternatif yang rapi beserta verifikasi bootloader sesuai dokumentasi resmi ROM.",
      },
    ],
    keywords: ["pixel", "google", "root", "magisk", "kernelsu", "custom rom", "bootloop", "fastboot", "firmware"],
    faqs: [
      {
        question: "Apakah Google Pixel eks-Verizon (OEM Unlocking abu-abu) bisa di-Root atau Custom ROM?",
        answer: "Unit carrier-locked seperti Verizon umumnya mengunci permanen opsi OEM Unlocking sehingga tidak bisa di-UBL. Namun perbaikan sistem dasar via sideload OTA resmi tetap bisa dibantu.",
      },
      {
        question: "Apakah pengerjaan software Google Pixel bisa dilakukan remote?",
        answer: "Ya, sangat ideal untuk pengerjaan remote via AnyDesk karena Google menyediakan driver USB dan platform-tools resmi yang stabil di Windows.",
      },
      {
        question: "Berapa biaya servis software Google Pixel?",
        answer: "Biaya mulai dari Rp50.000 tergantung jenis tindakan (flashing, root, atau instalasi ROM). Diskusikan model Pixel Anda lewat WhatsApp.",
      },
    ],
  },
];

export function getBrandProfile(slug: string): BrandProfile | undefined {
  return BRAND_PROFILES.find((b) => b.slug === slug);
}
