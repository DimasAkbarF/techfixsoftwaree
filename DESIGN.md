# DESIGN.md: TechFixSoftware

## 1. Design Read (Evidence-Based)

- **Product:** TechFixSoftware — website layanan servis software Android yang menggabungkan katalog layanan, penangkapan lead via WhatsApp (DEC-003), dan CMS konten dalam satu produk.
- **Target Audience:** Pemilik device Android yang mengalami bootloop/brick/stuck logo dan ingin konsultasi cepat; pelanggan offline yang hanya membawa USB sesuai device (DEC-001, DEC-002); satu admin pemilik TechFixSoftware yang mengelola layanan, lead, artikel, dan testimoni.
- **Product Type:** Other: *service catalog + lead funnel + single-operator CMS*.
- **Primary User Goal:** Menemukan layanan yang relevan, mengirim form konsultasi singkat, lalu lanjut ke WhatsApp dengan pesan terisi (FR-04, FR-05).
- **User Roles & Workflows:**
  - Guest: beranda → katalog + filter kategori (FR-09) → detail layanan (FR-03) → form konsultasi → WhatsApp (FR-04). Jalur sekunder: artikel (FR-06), testimoni read-only (FR-07), alur layanan (FR-08).
  - Admin: login (FR-10) → dashboard ringkasan (FR-11) → triase lead per status `NEW`/`CONTACTED`/`SCHEDULED`/`DONE`/`CANCELLED` (FR-13, DEC-004) → CRUD layanan (FR-12), artikel (FR-14), testimoni (FR-15), media (FR-16), pengaturan situs (FR-17).
- **Brand / Aesthetic Direction:** Editorial-teknis, lapang, tanpa dekorasi. Struktur dibaca seperti dokumentasi servis: judul tegas, daftar bergaris rambut (hairline), angka harga berbentuk label teks (`mulai dari Rp50.000`), bukan badge promo.
- **Key Personality Traits:** presisi, kalem, terbuka (transparan soal alur dan ketiadaan toko fisik).

## 2. Design Dials (Context-Specific)

| Dial | Value | Rationale |
|:---|:---|:---|
| DESIGN_VARIANCE | 4 | Halaman publik butuh konsistensi katalog dan keterbacaan cepat; variasi hanya pada komposisi (list katalog vs. artikel editorial vs. quote testimoni), bukan pada elemen acak. |
| MOTION_INTENSITY | 3 | Tugas utama adalah membaca dan mengirim form; animasi dibatasi pada feedback interaksi (hover, fokus, buka panel). Admin butuh kecepatan kerja, bukan tontonan. |
| VISUAL_DENSITY | 4 (publik) / 7 (admin) | Publik: satu kolom konten, napas lebar. Admin: tabel lead, tabel artikel, dan form padat dengan hierarki kuat agar triase cepat. |

## 3. Visual Identity & Product-Type Adaptation

Karena produk ini *katalog + CMS*, sistem visual dipisah dua register namun satu token:

- **Register publik:** hierarki tipografi kuat, hairline `--color-border`, grid 12 kolom, satu aksi dominan per viewport (CTA WhatsApp).
- **Register admin:** kepadatan tinggi, tabel sebagai warga kelas satu, label status berbentuk teks kapsul kecil (bukan ikon saja), angka tabular.

Distinktivitas dibangun dari **spasi, garis rambut, dan kontras tipografi** — bukan gradien dekoratif, frosted glass, bayangan berlapis, atau sudut membulat besar. Radius global kecil (`--radius: 6px`) agar kesan "alat kerja" konsisten. Ikon wajib `@tabler/icons-react` (bukan Lucide, sesuai PRD §9).

Pengecualian yang disengaja: **hero beranda** memakai satu bidang gradien gelap→terang (`hero-shell` + `HeroBackground`) yang meluruh mulus ke kanvas publik bersih (`--page-bg: #f4f7f6`). Enam halaman internal memakai header arsitektural terang (`.page-header`: tint mint halus `#eaf2ef → #f4f7f6` + micro-grid teknis + hairline bawah) agar menyatu dengan navbar terang dan menjaga konten langsung tampil *above the fold*. Kontras antar-section dibuat oleh hairline dan permukaan `#FBFDFC`/`#FFFFFF`, bukan blok warna berat.

**Logo:** aset resmi `public/brand/techfix-software.png` (latar transparan) dipasang di header, footer, dan sidebar admin. Wordmark tidak diketik ulang dengan font lain agar bentuk huruf tetap sesuai logo pemilik.

## 4. Semantic Color System (Color Discipline)

```css
:root {
  /* Netral = 90% antarmuka. Putih kebiruan menahan navy + teal logo. */
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-fg: #0B1220;        /* navy logo */
  --color-muted: #5B6576;     /* abu logo */
  --color-border: #E1E7EC;

  /* Brand diturunkan dari logo resmi */
  --color-primary: #0B1220;   /* navy: teks kuat, header, tombol admin */
  --color-secondary: #047857; /* emerald gelap yang lolos kontras teks (#065F46 di kanvas publik) */
  --color-accent: #0F766E;    /* teal brand untuk link, ikon & state aktif */
  --cta-gradient: linear-gradient(90deg, #34d399 0%, #14b8a6 100%); /* CTA WhatsApp & aksi utama */
  --color-success: #1F7A4D;
  --color-warning: #A15C07;
  --color-danger: #B3261E;

  --radius: 6px;
}
```

**Sumber warna:** logo resmi memakai navy `#0B1220`, teal `#0D9488`, dan abu `#5B6576` di atas putih. Latar `#F5F7FA` dipilih sebagai putih kebiruan agar logo transparan menyatu tanpa kotak putih, sementara navy dan teal tetap terbaca. Teal logo digelapkan sedikit ke `#0F766E` hanya untuk teks sekunder agar lolos kontras WCAG AA; blok teal pada logo tetap memakai nilai aslinya.

**Aturan pakai:** `--color-accent` hanya untuk satu aksi dominan per viewport (CTA konsultasi) dan indikator fokus; tidak untuk dekorasi. `--color-success/warning/danger` hanya untuk status lead dan pesan sistem, selalu disertai teks. Gradien biru/ungu neon, glow, dan mesh background **dilarang**.

## 5. Typography & Type Scale (Typography Discipline)

- **Display/Heading:** *Plus Jakarta Sans* — grotesque geometris dengan karakter huruf yang tegas, mendukung kesan rapi dan lokal.
- **Body/UI:** *IBM Plex Sans* — netral, x-height besar, angka tabular baik untuk tabel admin dan nomor WhatsApp.
- **Mono (slug, nomor, ID):** *IBM Plex Mono*.

Ketiganya dimuat lewat `next/font/google` (self-host, `display: swap`), bukan stylesheet Google Fonts di `<head>`, agar tidak ada request render-blocking.

Wordmark pada logo tetap memakai aset gambar resmi; tipografi halaman memakai Plus Jakarta Sans + IBM Plex Sans. Jangan merekonstruksi wordmark dengan font halaman karena bentuk huruf logo adalah identitas tetap.

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
```

| Level | Size | Weight | Line-Height | Tracking | Rationale |
|:---|:---|:---|:---|:---|:---|
| h1 | 40px / 2.5rem | 700 | 1.10 | -0.02em | Judul hero & nama layanan |
| h2 | 28px / 1.75rem | 700 | 1.20 | -0.01em | Judul seksi halaman |
| h3 | 22px / 1.375rem | 600 | 1.25 | 0 | Subseksi, judul artikel di daftar |
| h4 | 18px / 1.125rem | 600 | 1.35 | 0 | Label grup form admin |
| body | 16px / 1rem | 400 | 1.60 | 0 | Konten artikel, deskripsi layanan |
| body-sm | 14px / 0.875rem | 400 | 1.50 | 0 | Tabel, metadata, catatan |
| caption | 12px / 0.75rem | 500 | 1.40 | 0.08em (uppercase) | Label status, kategori, breadcrumb |

## 6. Layout Strategy & Anti-Repetition Rules

Pola struktural per halaman — **tidak boleh** memakai "Hero → 3 kartu" berulang:

| Halaman | Pola |
|:---|:---|
| Beranda (FR-01) | Hero asimetris (logo + nilai + CTA di kolom 7/12) → daftar layanan unggulan sebagai **baris bergaris** → testimoni sebagai blok kutipan → artikel terbaru sebagai daftar editorial |
| Katalog (FR-02, FR-09) | **Filter bar + data list** dua kolom (nama/slug + kategori + label harga), bukan grid kartu |
| Detail layanan (FR-03) | **Split 8/4**: konten (deskripsi, gejala, persiapan) + panel CTA melekat (nomor WA & form) |
| Alur layanan (FR-08) | **Timeline vertikal** bernomor (konsultasi → kesepakatan harga → perjanjian → penyerahan device) |
| Artikel (FR-06) | Daftar editorial: cover kecil kiri, judul + tanggal kanan |
| Admin lead (FR-13) | **Master/detail**: tabel lead + panel detail & catatan internal |
| Admin CMS (FR-12/14/15) | **Form + preview** dua kolom pada desktop, satu kolom pada mobile |

**Grid & spacing:** unit dasar 4px; skala `4, 8, 12, 16, 24, 32, 48, 64, 96`. Container publik maks 1200px, admin maks 1440px. Gutter 16px (mobile) / 24px (tablet) / 32px (desktop). Jarak antar seksi 64px publik, 32px admin.

## 7. Anti-AI-Slop Rules (Avoid vs. Prefer)

- Avoid: grid tiga kartu fitur → **Prefer** daftar layanan berbasis konten dengan baris bergaris.
- Avoid: setiap seksi dibungkus kartu membulat → **Prefer** pemisahan lewat spasi, hairline, dan perataan.
- Avoid: gradien ungu/biru dan blob latar → **Prefer** permukaan datar `--color-bg`/`--color-surface` dengan aksen semantik jarang.
- Avoid: ikon dekoratif dan bentuk abstrak tanpa makna → **Prefer** hierarki tipografi, label status tekstual, ikon fungsional Tabler.
- Avoid: animasi layout-heavy dan parallax → **Prefer** transisi `opacity`/`transform` ≤150ms hanya untuk feedback interaksi.

## 8. Card & Container Discipline

- **Diizinkan:** widget metrik dashboard (FR-11), panel detail lead, panel pratinjau media library, item hasil upload.
- **Dilarang:** artikel, deskripsi layanan, testimoni, dan daftar katalog — semuanya memakai blok teks + hairline. Testimoni memakai garis kiri 2px `--color-border`, bukan kartu.
- **Nesting kartu dilarang** (Card → Card → Card); panel admin boleh memuat tabel atau form, bukan kartu lain.

## 9. Component Rules & Action Hierarchy

| Tier | Gaya | Pemakaian |
|:---|:---|:---|
| Primary | Filled `--color-accent`, teks putih, 44px min | "Konsultasi via WhatsApp" (satu per viewport) |
| Secondary | Outline `--color-border`, teks `--color-fg` | "Lihat alur layanan", aksi tabel admin |
| Tertiary | Teks bergaris bawah | Navigasi, "baca selengkapnya", reset filter |

**State:** hover = perubahan `--color-surface` → `#F1F4F6` atau underline (bukan scale); focus-visible = ring 2px `--color-accent` offset 2px; disabled = opacity 45% + `cursor: not-allowed` + `aria-disabled="true"` (CTA WhatsApp dinonaktifkan bila `whatsappNumber` NULL — API.md `WHATSAPP_NOT_CONFIGURED`); selected = border kiri 2px `--color-accent` + teks `--color-fg`.

## 10. Behavioral Responsive Design

Breakpoint: 360px, 768px, 1024px, 1440px.

- < 768px: split 8/4 detail layanan menjadi **stack**; panel CTA menjadi sticky bottom bar dengan satu tombol primary.
- < 768px: tabel lead admin berubah menjadi daftar baris (nama, device, status, waktu); kolom catatan & `contactedAt` disembunyikan ke panel detail.
- Navigasi publik: header horizontal di ≥1024px; di mobile menjadi sheet menu (Tabler `IconMenu2`), bukan bottom tab bar.
- Filter kategori katalog: chips horizontal scroll pada mobile, baris wrap pada desktop.
- Form konsultasi selalu satu kolom; tidak pernah dua kolom di semua ukuran.

## 11. States (Loading, Empty, Error)

- **Loading:** skeleton dengan bentuk dan tinggi identik container aslinya — daftar katalog 6 baris (72px), daftar artikel 4 baris, tabel lead 8 baris, panel detail 3 blok. Spinner hanya di dalam tombol submit (dengan `aria-busy`).
- **Empty:** katalog tanpa hasil filter → "Tidak ada layanan pada kategori ini." + aksi "Reset filter". Admin lead kosong → "Belum ada lead masuk." + tautan ke halaman layanan publik. Testimoni kosong → seksi disembunyikan, bukan placeholder palsu.
- **Error:** alert sebaris di atas form dengan `error.code` dari API.md (`VALIDATION_ERROR`, `RATE_LIMITED`, `WHATSAPP_NOT_CONFIGURED`, `INTERNAL_ERROR`), pesan bahasa manusia, dan tombol "Coba lagi". Kegagalan simpan lead **tidak boleh** menampilkan sukses atau redirect (NFR-05).

## 12. Accessibility & Inclusivity (WCAG 2.1 AA)

- Semua elemen interaktif dapat dicapai via keyboard; urutan fokus mengikuti urutan visual.
- Focus ring terlihat: 2px `--color-accent`, `outline-offset: 2px`, tidak pernah `outline: none` tanpa pengganti.
- Touch target minimum 44×44px (termasuk ikon aksi di tabel admin).
- Setiap input memakai `<label for>`; error validasi dihubungkan via `aria-describedby` dan `role="alert"`.
- Status lead tidak boleh dibedakan warna saja: sertakan teks (`NEW`, `CONTACTED`, dst.) dan, bila ikon dipakai, `aria-label`.
- Rating testimoni ditampilkan sebagai teks "4 dari 5" di samping ikon bintang (NFR-03).

## 13. Design Rationale

Katalog berbentuk daftar (bukan grid kartu) karena pelanggan membandingkan jenis kerusakan, bukan memilih produk visual — keputusan ini juga menegakkan DEC-002: label `mulai dari Rp50.000` tampil sebagai teks, tanpa angka pasti dan tanpa badge diskon. Form singkat empat field (DEC-003) dijaga satu kolom agar konversi mobile tinggi bagi pelanggan yang hanya memegang ponsel. Admin memakai master/detail dan tabel padat karena DEC-004 meminta pengelolaan lead yang "rapih dan terstruktur": status, waktu kontak, dan catatan internal harus terbaca dalam satu pandangan. Karena bisnis tanpa toko fisik (DEC-002), halaman alur layanan dirancang sebagai timeline transparan untuk mengurangi keraguan — bukan halaman jualan. Rincian alur tinggal di `/cara-kerja` (dua sisi: pelanggan dan TechFixSoftware), sementara beranda menyimpan ringkasan empat langkah; nav `Layanan` memakai dropdown berisi maksimal 8 layanan terbit dan jatuh ke tautan biasa bila katalog kosong.

## 14. NO Invented Design Content Rule

Dilarang membuat testimoni fiktif, logo klien, tangkapan layar palsu, angka statistik ("10.000 device diperbaiki"), atau badge penghargaan. Testimoni hanya dirender dari tabel `Testimonial` yang diinput admin (DEC-005); bila kosong, tampilkan empty state. Label harga selalu berasal dari `SiteSetting.minPriceLabel`/`Service.priceFromLabel`. Nomor WhatsApp, jam operasional, dan estimasi pengerjaan yang belum ditetapkan tetap **TBD** dan tidak boleh diisi asumsi.

## 15. Design Pre-Flight Checklist

- [ ] Design is derived from PRD/project context.
- [ ] Design Read is specific.
- [ ] Design dials are intentional.
- [ ] Visual direction is justified.
- [ ] Color hierarchy is intentional.
- [ ] Typography is intentional.
- [ ] Cards are not overused.
- [ ] Layouts are not repetitive.
- [ ] No generic AI aesthetic was introduced without justification.
- [ ] Motion has a purpose.
- [ ] Responsive behavior is defined.
- [ ] Loading states are defined where relevant.
- [ ] Empty states are defined where relevant.
- [ ] Error states are defined where relevant.
- [ ] Accessibility is defined.
- [ ] No fake content was invented.
- [ ] Design feels specific to the product.
- [ ] A coding agent can implement the design without inventing major visual decisions.
- [ ] Design System is cohesive and reusable.