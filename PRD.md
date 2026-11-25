# PRD: TechFixSoftware

## 1. Executive Summary & Product Vision

TechFixSoftware adalah website fullstack layanan servis perangkat Android (software) yang menggabungkan **katalog layanan**, **penangkapan lead via WhatsApp**, dan **CMS konten** dalam satu produk. Pelanggan melihat daftar layanan (root, bootloop, brick, stuck logo, flashing, downgrade, dan layanan lain yang dikelola admin), lalu melanjutkan konsultasi melalui form singkat yang tersimpan sebagai lead dan diteruskan ke WhatsApp dengan pesan terisi (DEC-003).

Model bisnis bersifat **rumahan tanpa toko fisik**: tidak ada harga pasti di website, hanya penanda "mulai dari Rp50.000" (DEC-002). Harga final ditetapkan setelah konsultasi WhatsApp dan kesepakatan. Visi produk: menjadi kanal konsultasi servis Android yang rapi, terstruktur, dan terpercaya, dengan identitas visual brand TechFixSoftware (logo milik pengguna) yang konsisten.

## 2. Problem Statement & Target Users

**Masalah**
- Konsultasi servis Android saat ini tersebar di chat WhatsApp tanpa pencatatan, sehingga lead mudah hilang dan tidak terukur.
- Calon pelanggan tidak punya gambaran layanan apa saja yang tersedia dan apa yang harus disiapkan (mis. membawa USB sesuai device).
- Konten edukasi (artikel) dan bukti sosial (testimoni) tidak terpusat.

**Target Users**
- **Pelanggan online** — pemilik device Android yang mengalami bootloop/brick/stuck logo dan ingin konsultasi cepat.
- **Pelanggan offline** — datang/kirim device setelah perjanjian WhatsApp; tidak punya laptop, cukup membawa USB sesuai device (DEC-001, DEC-002).
- **Admin (pemilik TechFixSoftware)** — mengelola layanan, lead, artikel, dan testimoni dari satu dashboard.

## 3. System Scope & User Roles

**Dalam cakupan:** website publik (beranda, katalog layanan, detail layanan, artikel, testimoni, halaman alur layanan), form konsultasi → lead → WhatsApp, dashboard admin (auth, layanan, lead, artikel, testimoni, media, pengaturan situs).

| Kemampuan | Guest | Admin |
|:---|:---|:---|
| Lihat katalog & detail layanan | Ya | Ya |
| Baca artikel & testimoni | Ya | Ya |
| Kirim form konsultasi (buat lead) | Ya | Ya |
| Kelola layanan | Tidak | Ya |
| Lihat & ubah status lead | Tidak | Ya |
| Kelola artikel & media | Tidak | Ya |
| Kelola testimoni | Tidak | Ya |
| Ubah pengaturan situs | Tidak | Ya |

Peran admin tunggal dikelola melalui Better Auth; registrasi publik tidak dibuka.

## 4. Functional Requirements

**Sisi Publik**

- **FR-01** Beranda menampilkan hero brand TechFixSoftware (logo milik pengguna), ringkasan layanan unggulan, testimoni terpilih, artikel terbaru, dan CTA konsultasi.
- **FR-02** Halaman katalog layanan menampilkan daftar layanan aktif dengan indikator harga `mulai dari Rp50.000`; **tidak ada harga pasti** yang ditampilkan (DEC-002).
- **FR-03** Halaman detail layanan memuat deskripsi, gejala kerusakan yang ditangani, persiapan pelanggan (mis. bawa USB sesuai device), dan CTA konsultasi (DEC-001).
- **FR-04** Form konsultasi singkat mengumpulkan `nama`, `jenis device`, dan `keluhan`; sistem menyimpan lead lalu mengarahkan ke WhatsApp dengan pesan terisi otomatis (DEC-003).
- **FR-05** Setiap CTA WhatsApp memakai nomor admin dari pengaturan situs dan menyertakan pesan prateks yang relevan dengan konteks layanan.
- **FR-06** Halaman artikel menampilkan daftar artikel `published` dan halaman detail artikel dengan konten dan cover image.
- **FR-07** Halaman testimoni menampilkan testimoni `published` (nama, device, ulasan, rating) secara read-only; tidak ada form testimoni publik (DEC-005).
- **FR-08** Halaman alur layanan menjelaskan tahapan: konsultasi WhatsApp → kesepakatan harga → perjanjian → penyerahan device (DEC-002).
- **FR-09** Pengunjung dapat memfilter katalog layanan berdasarkan kategori.

**Sisi Admin**

- **FR-10** Admin login melalui Better Auth; seluruh route `/admin` terlindungi dan hanya dapat diakses sesi terautentikasi.
- **FR-11** Dashboard menampilkan ringkasan: jumlah lead baru, jumlah layanan aktif, jumlah artikel, jumlah testimoni.
- **FR-12** Admin dapat membuat, mengubah, mempublikasikan, dan menghapus layanan (nama, slug, kategori, deskripsi, gejala, teks harga minimum, ikon, urutan tampil).
- **FR-13** Admin dapat melihat daftar lead, memfilter berdasarkan status, membuka detail, mengubah status, dan menambahkan catatan internal. Status lead: `NEW`, `CONTACTED`, `SCHEDULED`, `DONE`, `CANCELLED` (DEC-004).
- **FR-14** Admin dapat membuat, mengubah, menyimpan sebagai draft, dan mempublikasikan artikel (judul, slug, konten, cover image, meta SEO).
- **FR-15** Admin dapat menambah, mengubah, mempublikasikan, dan menghapus testimoni (nama, device, ulasan, rating 1–5) (DEC-005).
- **FR-16** Admin dapat mengunggah gambar (cover artikel, thumbnail layanan, favicon) melalui UploadThing dan memilihnya dari media library.
- **FR-17** Admin dapat mengubah pengaturan situs: nomor WhatsApp, teks harga minimum, dan identitas brand.

## 5. Non-Functional Requirements

| ID | Category | Requirement | Target |
|:---|:---|:---|:---|
| NFR-01 | Performance | LCP beranda dan katalog layanan | TBD |
| NFR-02 | Responsiveness | Layout mobile-first berfungsi pada lebar 360px–1440px | TBD |
| NFR-03 | Accessibility | Kontras warna, focus state, dan label form sesuai WCAG 2.1 AA | TBD |
| NFR-04 | Security | Kredensial sesi dikelola Better Auth; validasi input server-side pada Server Actions | TBD |
| NFR-05 | Data Integrity | Lead tersimpan sebelum redirect WhatsApp; kegagalan simpan tidak boleh dianggap sukses | TBD |
| NFR-06 | SEO | Metadata per halaman, sitemap, dan slug yang stabil | TBD |
| NFR-07 | Anti-Spam | Rate limit pengiriman form konsultasi | TBD |
| NFR-08 | Observability | Pencatatan error server & kegagalan upload | TBD |

## 6. Technology Stack & Rationale

| Component | Technology | Why |
|:---|:---|:---|
| Framework Frontend | Next.js 15 (App Router) + React 19 + TypeScript | SSR/ISR untuk halaman katalog dan artikel, tipe aman |
| UI Kit & Ikon | Tailwind CSS v4 + shadcn/ui + @tabler/icons-react | Komponen konsisten; ikon non-Lucide sesuai permintaan pengguna |
| Database & ORM | Neon Postgres + Prisma ORM v6 | Postgres serverless, migrasi terversi |
| Autentikasi Admin | Better Auth + Neon Postgres | Sesi admin terpusat pada database yang sama |
| Penyimpanan Gambar | UploadThing | Upload cover artikel & aset brand tanpa server file sendiri |
| Hosting & Deploy | Vercel | Deploy Next.js native, preview per perubahan |
| Backend / API | Next.js API & Server Actions | Mutasi form dan CMS tanpa service terpisah |

## 7. Success Metrics & KPIs

| Metric | How Measured | Target |
|:---|:---|:---|
| Jumlah lead masuk per bulan | Query tabel lead di dashboard | TBD |
| Rasio lead → percakapan WhatsApp | Perbandingan lead tersimpan vs klik redirect | TBD |
| Rasio lead → deal | Perubahan status `DONE` terhadap total lead | TBD |
| Waktu respons admin ke lead baru | Selisih waktu pembuatan lead dan status `CONTACTED` | TBD |
| Trafik artikel | Analytics kunjungan halaman artikel | TBD |

## 8. Risk Analysis & Mitigation

| Risk | Impact | Mitigation Strategy |
|:---|:---|:---|
| Lead hilang karena pelanggan menutup WhatsApp sebelum admin merespons | Kehilangan prospek | Lead disimpan lebih dulu (FR-04); dashboard menampilkan daftar `NEW` (FR-13) |
| Form konsultasi disalahgunakan bot | Data lead kotor | Rate limit dan validasi server-side (NFR-07) |
| Ekspektasi harga pelanggan berbeda dengan kesepakatan | Negosiasi berulang | Website hanya menampilkan `mulai dari Rp50.000`; harga final via konsultasi (DEC-002) |
| Tidak ada toko fisik sehingga pelanggan ragu | Konversi turun | Halaman alur layanan transparan (FR-08) dan testimoni terkurasi (FR-15) |
| Admin tunggal menjadi bottleneck konten & lead | Konten stagnan | CMS terpusat agar update cepat (FR-12, FR-14) |

## 9. Constraints, Assumptions & Open Decisions

**Constraints**
- Harga pasti tidak boleh ditampilkan di website; hanya teks "mulai dari" (DEC-002).
- Tidak ada form testimoni publik; testimoni hanya lewat admin (DEC-005).
- Ikon wajib dari `@tabler/icons-react`, bukan Lucide.

**Assumptions**
- Logo brand TechFixSoftware sudah tersedia dan diunggah sebagai aset situs.
- Satu akun admin digunakan untuk seluruh operasional.
- Nomor WhatsApp admin sudah ada dan diisi melalui pengaturan situs.

**Open Decisions (TBD)**
- Nomor WhatsApp resmi dan format pesan prateks — menunggu admin.
- Daftar final kategori layanan dan teks setiap layanan — menunggu admin.
- Kebijakan garansi pasca-servis — TBD.
- Jam operasional dan estimasi waktu pengerjaan — TBD.
- Target performa (NFR-01), rate limit (NFR-07), dan seluruh KPI di §7 — TBD.
- Alur pengiriman device untuk pelanggan luar kota — TBD.

## 10. Out of Scope

- Payment gateway, pembayaran online, dan invoice otomatis.
- Akun pelanggan, riwayat servis, dan pelacakan status perbaikan.
- Form testimoni publik dan moderasi ulasan pengunjung.
- Multi-admin dengan perbedaan peran (RBAC lanjutan).
- Notifikasi WhatsApp otomatis via API pihak ketiga (WhatsApp Business API).
- Aplikasi mobile native.
- Manajemen stok suku cadang dan penjadwalan kurir.