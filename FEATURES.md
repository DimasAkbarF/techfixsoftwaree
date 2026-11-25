# FEATURES.md: TechFixSoftware

Dokumen ini menjabarkan modul fitur TechFixSoftware sebagai perilaku yang dapat diuji. Skema data merujuk ke DATABASE.md dan kontrak endpoint merujuk ke API.md; dokumen ini tidak mengulangnya.

## F-01 Katalog & Detail Layanan

**Mengimplementasikan:** FR-02, FR-03, FR-09

**User stories**
- Sebagai pelanggan online, saya ingin melihat daftar layanan beserta penanda `mulai dari Rp50.000`, agar saya tahu apakah masalah device saya bisa ditangani.
- Sebagai pelanggan online, saya ingin memfilter layanan per kategori, agar saya cepat menemukan layanan yang relevan.
- Sebagai pelanggan online, saya ingin membaca gejala dan persiapan pada detail layanan, agar saya tahu cukup membawa USB sesuai device (DEC-001).

**Behavior & business logic**
- Hanya layanan dengan `isPublished = true` yang tampil; urutan mengikuti `sortOrder` menaik.
- Harga pasti **tidak pernah** dirender; satu-satunya penanda harga adalah `priceFromLabel` (DEC-002). Bila kosong, jatuh ke `SiteSetting.minPriceLabel`.
- Detail layanan diakses via `slug`; layanan tidak terbit diperlakukan sebagai tidak ditemukan.
- Filter kategori bersifat opsional dan tercermin pada query string agar bisa dibagikan.

**Acceptance criteria**
- Given layanan `isPublished = false`, When katalog dibuka, Then layanan tidak muncul.
- Given slug valid dan terbit, Then halaman detail memuat `description`, `symptoms`, `preparation`, dan CTA konsultasi.
- Given kategori dipilih, Then hanya layanan kategori tersebut tampil dan filter tetap terlihat aktif.
- Then tidak ada elemen DOM yang menampilkan nominal harga selain teks label (DEC-002).

**Edge cases**
- Katalog kosong → empty state "Belum ada layanan" disertai CTA WhatsApp.
- Slug tidak ditemukan → halaman 404.
- Filter tanpa hasil → empty state dengan aksi reset filter.

**Open questions** — Daftar kategori final dan teks tiap layanan: TBD (PRD §9).

## F-02 Konsultasi → Lead → WhatsApp

**Mengimplementasikan:** FR-04, FR-05 (DEC-003, NFR-05)

**User stories**
- Sebagai pelanggan online, saya ingin mengisi nama, nomor WhatsApp, jenis device, dan keluhan, agar konsultasi saya tercatat dan langsung terhubung ke WhatsApp admin.
- Sebagai admin, saya ingin setiap konsultasi tersimpan sebagai lead, agar tidak ada prospek yang hilang saat pelanggan menutup WhatsApp.

**Behavior & business logic**
- Form hanya meminta `name`, `phone`, `deviceType`, `complaint`; `serviceId` diisi otomatis dari konteks halaman layanan dan bersifat opsional.
- Validasi dijalankan server-side; keempat field wajib dan tidak boleh string kosong. `phone` dinormalisasi ke format `62…` dan harus berupa nomor WhatsApp yang masuk akal; nomor legacy pada baris lama boleh `NULL`.
- Lead disimpan dengan status `NEW` **sebelum** redirect (NFR-05). Bila penyimpanan gagal, tidak ada redirect dan pengguna menerima pesan error.
- Setelah sukses, pengguna diarahkan ke `wa.me` dengan pesan prateks berisi nama, jenis device, keluhan, dan nama layanan bila ada.
- Nomor tujuan diambil dari `SiteSetting.whatsappNumber` (FR-05). Bila bernilai `NULL`, CTA dinonaktifkan dan endpoint mengembalikan `503 WHATSAPP_NOT_CONFIGURED`.

**Acceptance criteria**
- Given semua field valid, Then lead tersimpan (`status = NEW`) dan browser diarahkan ke URL WhatsApp berisi pesan terisi.
- Given insert database gagal, Then tidak ada redirect dan error dilaporkan ke pengguna.
- Given `whatsappNumber` belum diisi, Then CTA tidak dapat diklik dan tidak ada lead dibuat.
- Given field kosong, Then respons `422 VALIDATION_ERROR` dengan detail field.

**Edge cases**
- Submit ganda (klik cepat) — penanganan idempotensi: TBD.
- Batas panjang `complaint`: TBD.
- WhatsApp tidak tersedia di perangkat → tampilkan tautan manual agar pesan bisa disalin.

**Open questions** — Nomor WhatsApp resmi, format pesan prateks, dan batas rate limit (NFR-07): TBD.

## F-03 Halaman Alur Layanan

**Mengimplementasikan:** FR-08 (DEC-002)

**User story** — Sebagai pelanggan online, saya ingin memahami tahapan servis, agar saya tidak ragu karena TechFixSoftware tidak memiliki toko fisik.

**Behavior & business logic**
- Menampilkan empat tahap berurutan: konsultasi WhatsApp → kesepakatan harga → perjanjian → penyerahan device.
- Menegaskan bahwa harga final hanya ditetapkan setelah konsultasi dan tidak ditampilkan di website (DEC-002).
- Diakhiri CTA konsultasi yang memakai nomor dari pengaturan situs.

**Acceptance criteria**
- Then keempat tahap tampil berurutan dan dapat dibaca pada lebar 360px.
- Then halaman memuat CTA WhatsApp dan tidak memuat nominal harga pasti.

**Open questions** — Jam operasional, estimasi pengerjaan, dan alur pengiriman device luar kota: TBD.

## F-04 Beranda

**Mengimplementasikan:** FR-01

**User story** — Sebagai pengunjung, saya ingin melihat ringkasan brand, layanan unggulan, testimoni, dan artikel terbaru, agar saya cepat menilai kredibilitas TechFixSoftware.

**Behavior & business logic**
- Hero memakai logo brand milik pengguna (`SiteSetting.logoUrl`).
- Layanan unggulan: `isPublished = true`, urut `sortOrder`. Testimoni terpilih: `isPublished = true` terbaru. Artikel terbaru: `status = PUBLISHED` urut `publishedAt` menurun.
- Jumlah item per section: TBD.

**Acceptance criteria**
- Given salah satu section tidak memiliki data, Then section disembunyikan, bukan menampilkan placeholder kosong.
- Then CTA konsultasi tampil pada hero.

## F-05 Artikel (Publik & CMS)

**Mengimplementasikan:** FR-06, FR-14

**User stories**
- Sebagai pengunjung, saya ingin membaca artikel `PUBLISHED` beserta cover image, agar saya mendapat panduan seputar masalah Android.
- Sebagai admin, saya ingin menulis, menyimpan draft, dan mempublikasikan artikel, agar konten bisa diperbarui cepat.

**Behavior & business logic**
- Artikel `DRAFT` tidak tampil di daftar publik dan detailnya menghasilkan 404.
- `publishedAt` diisi saat artikel pertama kali dipublikasikan dan tidak diubah pada penyuntingan berikutnya.
- `slug` unik; `metaTitle` dan `metaDescription` opsional (NFR-06).

**Acceptance criteria**
- Given artikel `DRAFT`, When daftar publik dibuka, Then artikel tidak muncul.
- Given admin mempublikasikan artikel, Then `status = PUBLISHED` dan `publishedAt` terisi.
- Given slug sudah dipakai artikel lain, Then `422 VALIDATION_ERROR`.

**Edge cases** — Artikel tanpa cover image memakai placeholder; konten kosong tidak boleh dipublikasikan.

**Open questions** — Format editor konten (rich text/markdown) dan penanganan konflik saat dua tab menyunting artikel yang sama: TBD.

## F-06 Testimoni

**Mengimplementasikan:** FR-07, FR-15 (DEC-005)

**User stories**
- Sebagai pengunjung, saya ingin membaca testimoni terkurasi, agar saya yakin pada kualitas servis.
- Sebagai admin, saya ingin menambahkan testimoni manual, agar isinya terkontrol.

**Behavior & business logic**
- Tidak ada form atau endpoint testimoni publik (DEC-005); satu-satunya sumber data adalah dashboard admin.
- `rating` wajib bilangan bulat 1–5, divalidasi di Server Action.
- `isPublished` default `false`; hanya testimoni terbit yang tampil publik.

**Acceptance criteria**
- Then halaman publik bersifat read-only dan tidak memuat elemen input.
- Given `rating` bernilai 0 atau 6, Then `422 VALIDATION_ERROR`.
- Given testimoni `isPublished = false`, Then tidak tampil di halaman publik.

**Edge cases** — Daftar kosong → empty state "Belum ada testimoni". Hapus testimoni yang sedang tampil di beranda → section beranda ikut menyesuaikan.

## F-07 Autentikasi Admin & Dashboard

**Mengimplementasikan:** FR-10, FR-11

**User stories**
- Sebagai admin, saya ingin login dan melihat ringkasan operasional, agar saya tahu pekerjaan yang menunggu.

**Behavior & business logic**
- Sesi dikelola Better Auth; seluruh route `/admin` dan `/api/v1/admin/*` memerlukan sesi valid.
- Registrasi publik tidak dibuka; akun admin dibuat di luar alur aplikasi.
- Ringkasan dashboard menampilkan jumlah lead `NEW`, layanan aktif, artikel, dan testimoni.

**Acceptance criteria**
- Given tanpa sesi, When membuka `/admin`, Then diarahkan ke halaman login.
- Given sesi kedaluwarsa saat submit form admin, Then respons `401` dan pengguna diarahkan login kembali.
- Then angka ringkasan konsisten dengan data pada DATABASE.md.

**Edge cases** — Kegagalan sesi saat mutasi: perubahan tidak tersimpan dan state form: TBD.

## F-08 Manajemen Lead

**Mengimplementasikan:** FR-13 (DEC-004)

**User story** — Sebagai admin, saya ingin melihat, memfilter, dan memperbarui status lead, agar setiap prospek tertangani berurutan.

**Behavior & business logic**
- Daftar lead dapat difilter berdasarkan `status` dan diurutkan berdasarkan `createdAt` menurun.
- Status mengikuti DEC-004: `NEW`, `CONTACTED`, `SCHEDULED`, `DONE`, `CANCELLED`.
- `contactedAt` diisi saat status **pertama kali** menjadi `CONTACTED` dan tidak ditimpa pada perubahan berikutnya.
- `adminNote` bersifat internal dan tidak pernah tampil di sisi publik.

**Acceptance criteria**
- Given lead `NEW`, When admin mengubah ke `CONTACTED`, Then `contactedAt` terisi.
- Given lead sudah pernah `CONTACTED`, When status diubah lagi, Then `contactedAt` tidak berubah.
- Then filter status yang tidak menghasilkan data menampilkan empty state.

**Edge cases** — Lead tanpa `serviceId` tetap tampil tanpa konteks layanan. Perubahan status bersamaan dari dua tab: TBD.

**Open questions** — Bolehkah status kembali ke tahap sebelumnya (mis. `DONE` → `CONTACTED`): TBD.

## F-09 Manajemen Layanan

**Mengimplementasikan:** FR-12

**User story** — Sebagai admin, saya ingin mengelola katalog layanan, agar isinya selalu sesuai kemampuan servis.

**Behavior & business logic**
- Field yang dikelola: `name`, `slug`, `category`, `description`, `symptoms`, `preparation`, `priceFromLabel`, `icon`, `sortOrder`, `isPublished`.
- Ikon wajib berasal dari `@tabler/icons-react`, bukan Lucide.
- `priceFromLabel` hanya teks tampilan; tidak ada nominal harga pasti (DEC-002).
- Menghapus layanan tidak menghapus lead; `Lead.serviceId` menjadi `NULL` (lihat DATABASE.md).

**Acceptance criteria**
- Given slug sudah dipakai, Then `422 VALIDATION_ERROR`.
- Given layanan dihapus, Then lead terkait tetap ada dengan `serviceId` kosong.
- Given `isPublished` diubah ke `false`, Then layanan hilang dari katalog publik.

**Edge cases** — `icon` tidak dikenal pustaka → fallback ikon default; `sortOrder` duplikat diizinkan dan diurutkan sekunder berdasarkan `createdAt`.

## F-10 Media Library & Pengaturan Situs

**Mengimplementasikan:** FR-16, FR-17

**User stories**
- Sebagai admin, saya ingin mengunggah cover artikel, thumbnail layanan, dan logo, agar aset visual terpusat.
- Sebagai admin, saya ingin mengubah nomor WhatsApp dan label harga minimum, agar CTA publik selalu benar.

**Behavior & business logic**
- Upload memakai UploadThing; URL hasil unggah disimpan pada field terkait (`Article.coverImageUrl`, thumbnail `Service`, `SiteSetting.logoUrl`).
- Perubahan `whatsappNumber` langsung memengaruhi seluruh CTA WhatsApp (FR-05).
- `SiteSetting` adalah baris tunggal (`id = "singleton"`).

**Acceptance criteria**
- Given unggahan gagal, Then URL lama dipertahankan dan error ditampilkan.
- Given `whatsappNumber` diubah, Then CTA publik memakai nomor baru setelah halaman dimuat ulang.
- Then `minPriceLabel` dapat diubah tanpa mengubah data layanan yang sudah ada.

**Edge cases** — Menghapus aset yang masih dirujuk: TBD. Batas ukuran dan tipe file: TBD.

## Matriks Keterlacakan

| Fitur | FR | DEC |
|:---|:---|:---|
| F-01 | FR-02, FR-03, FR-09 | DEC-001, DEC-002 |
| F-02 | FR-04, FR-05 | DEC-003 |
| F-03 | FR-08 | DEC-002 |
| F-04 | FR-01 | — |
| F-05 | FR-06, FR-14 | — |
| F-06 | FR-07, FR-15 | DEC-005 |
| F-07 | FR-10, FR-11 | — |
| F-08 | FR-13 | DEC-004 |
| F-09 | FR-12 | DEC-002 |
| F-10 | FR-16, FR-17 | DEC-002 |