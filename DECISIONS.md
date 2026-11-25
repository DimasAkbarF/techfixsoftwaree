# Keputusan Produk: TechFixSoftware

Dokumen ini mencatat jawaban pengguna sesuai pilihan dan teks yang diberikan. Label `Dijawab` berarti opsi dipilih, bukan berarti semua detail dalam opsinya sudah ditentukan. Deskripsi opsi adalah konteks, bukan izin untuk mengarang nominal, SLA, atau kebijakan. Jika detail belum eksplisit, tandai `TBD` pada spesifikasi turunannya.

## DEC-001 — Bagaimana alur pemesanan servis yang Anda inginkan di web ini?

**Status:** Dijawab

**Jawaban pengguna:** katalog + leads whatsapp jadi pelanggan atau cs bisa melihat layanan dan melanjutkannya ke whatsapp dan bisa juga via offline jika pelanggan tidak mempunyai laptop ckup bawa usb sesuai devices nya

## DEC-002 — Untuk pelanggan offline yang datang langsung ke toko, bagaimana alur pemesanan dan pembayarannya?

**Status:** Dijawab

**Jawaban pengguna:** pelanggan melakukan perjanjian dengan saya karna saya tidak ada toko fisik secara langsung,karna saya rumahan,jadi apelanggan harus berkomunikasi lewat wa dan ceritakan atau konsultsikan permaslaahn device tersebut baru buat perjanjian setelah deal harga dan harga jangan di tampilkan di website ckup tampilkan mulai dari 50rb

## DEC-003 — Saat pelanggan menekan tombol konsultasi/booking di halaman layanan, alur mana yang Anda inginkan?

**Status:** Dijawab

**Jawaban pengguna:** Form singkat lalu WhatsApp, data tersimpan: Pelanggan mengisi nama, jenis device, dan keluhan; data masuk dashboard sebagai lead, lalu diarahkan ke WhatsApp dengan pesan terisi.

**Catatan implementasi:** Nomor WhatsApp ditambahkan sebagai field wajib keempat, karena lead tanpa nomor tidak dapat ditindaklanjuti saat pelanggan menutup WhatsApp. Field lama tetap ada; tidak ada field yang dihapus.

## DEC-004 — Karena data lead akan disimpan, sejauh apa pengelolaan lead di dashboard admin?

**Status:** Dijawab

**Jawaban pengguna:** sesuaikan saja agar rapih dan terstruktur

## DEC-005 — Bagaimana testimoni pelanggan sebaiknya dikumpulkan dan ditampilkan di website?

**Status:** Dijawab

**Jawaban pengguna:** Admin input manual: Admin menambahkan testimoni dari dashboard (nama, device, ulasan, rating). Tidak ada form publik; paling terkontrol dan cepat.
