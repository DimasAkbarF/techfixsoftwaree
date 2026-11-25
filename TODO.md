# TODO & Item BLOCKED: TechFixSoftware

Catatan untuk item yang berstatus **BLOCKED** atau **TBD** sesuai dengan spesifikasi (`PRD.md`, `TASKS.md`, `DECISIONS.md`). Dilarang mengarang angka, kebijakan, atau teks tanpa keputusan resmi dari pemilik TechFixSoftware.

---

## 1. Tugas BLOCKED (TASKS.md Bagian 4)

- [ ] **TASK-04 — Nomor WhatsApp Resmi Admin (`SiteSetting.whatsappNumber`)**
  - **Status:** BLOCKED
  - **Catatan:** Menunggu nomor WhatsApp resmi admin. Sebelum diisi, nilai di database disimpan sebagai `NULL` (bukan string kosong). Tombol CTA WhatsApp dinonaktifkan di sisi publik dengan indikator jelas (`503 WHATSAPP_NOT_CONFIGURED`).
- [ ] **TASK-08 — Format Pesan Prateks WhatsApp**
  - **Status:** BLOCKED
  - **Catatan:** Menunggu susunan kalimat, salam pembuka, dan detail pesan prateks resmi. Sementara menggunakan template terstruktur:
    `"Halo TechFixSoftware, saya {nama} ingin konsultasi servis {deviceType} dengan kendala: {keluhan}"`.
- [ ] **TASK-17 — Ambang & Mekanisme Rate Limiting (NFR-07) serta Error Logging (NFR-08)**
  - **Status:** BLOCKED
  - **Catatan:** Ambang batas pengiriman form konsultasi (mis. N request per menit/IP) dan target penyimpanan log error server belum diputuskan.
- [ ] **TASK-05 — Kategori Final Layanan & Teks Tiap Layanan**
  - **Status:** BLOCKED
  - **Catatan:** Menunggu daftar kategori final dan copy deskripsi/gejala/persiapan resmi untuk masing-masing layanan. Seeding awal hanya menggunakan data contoh realistis servis software Android.

---

## 2. Nilai TBD Lainnya (PRD §9, FEATURES.md)

- [ ] **Kebijakan Garansi Pasca-Servis (PRD §9):** Ketentuan garansi software setelah perbaikan (durasi dan syarat).
- [ ] **Jam Operasional & Estimasi Waktu Pengerjaan (PRD §9):** SLA dan jam kerja layanan servis.
- [ ] **Alur Pengiriman Device Pelanggan Luar Kota (PRD §9):** Prosedur ekspedisi/kurir untuk device luar kota.
- [ ] **Format Editor Artikel CMS (FEATURES.md F-05):** Markdown dengan live preview vs rich-text WYSIWYG.
- [ ] **Idempotensi & Batas Karakter Complaint (FEATURES.md F-02):** Batas maksimum panjang teks keluhan dan penanganan submit ganda cepat.
- [ ] **Target Performa & Responsivitas (NFR-01 s.d. NFR-03):** LCP dan ambang batas metrik performa formal.
