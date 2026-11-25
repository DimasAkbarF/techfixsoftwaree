# API.md: TechFixSoftware

## 1. Authentication & Authorization

Autentikasi admin memakai **Better Auth** dengan session tersimpan di Neon Postgres. Route login, logout, dan callback dikelola oleh handler Better Auth pada `/api/auth/*`; tidak ada endpoint login kustom di dokumen ini.

| Area | Aturan |
|:---|:---|
| Endpoint publik | Tidak memerlukan sesi |
| Endpoint admin | Prefix `/api/v1/admin/*`, wajib sesi Better Auth valid |
| Header sesi | `Cookie: <better-auth-session-cookie>` — nama cookie mengikuti konfigurasi Better Auth |
| Pemeriksaan sesi | `auth.api.getSession({ headers })` pada Route Handler / Server Action |
| Otorisasi | Satu peran admin; cukup memastikan `session.user` ada. RBAC multi-peran di luar cakupan (PRD §10) |
| Registrasi publik | Tidak dibuka (PRD §3) |

Respons `401 UNAUTHORIZED` bila sesi tidak ada atau kedaluwarsa. Respons `403 FORBIDDEN` bila sesi ada tetapi tidak memenuhi pemeriksaan admin. Endpoint publik pada §3.1 dan §3.2 tidak memakai header sesi.

## 2. Conventions

- Base path: `/api/v1`
- Format: `application/json; charset=utf-8`
- Tanggal: ISO 8601 UTC, contoh `2026-01-01T10:00:00.000Z`
- Semua field mengikuti nama pada `DATABASE.md` (`Lead.status`, `Testimonial.isPublished`, `Service.priceFromLabel`, dan seterusnya)
- Tidak ada field harga pasti pada respons publik; hanya `priceFromLabel` (DEC-002)

**Success envelope**

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

`meta` hanya dikirim pada endpoint berpaginasi.

**Error envelope**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": [
      { "field": "name", "message": "Wajib diisi" }
    ]
  }
}
```

**Pagination**

Query: `?page=1&perPage=20` (nilai contoh; default dan batas maksimum `perPage` TBD). Respons:

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "perPage": 20, "total": 0, "totalPages": 0 }
}
```

| Code | HTTP Status | Meaning |
|:---|:---|:---|
| `VALIDATION_ERROR` | 422 | Payload tidak lolos validasi |
| `UNAUTHORIZED` | 401 | Sesi admin tidak ada / kedaluwarsa |
| `FORBIDDEN` | 403 | Sesi tidak berhak mengakses resource |
| `NOT_FOUND` | 404 | Resource tidak ditemukan atau tidak dipublikasikan |
| `RATE_LIMITED` | 429 | Melebihi batas pengiriman form (NFR-07; nilai TBD) |
| `WHATSAPP_NOT_CONFIGURED` | 503 | `SiteSetting.whatsappNumber` belum diisi |
| `INTERNAL_ERROR` | 500 | Kegagalan server / database |

## 3. API Endpoints

### POST /api/v1/leads

**Description:** Menyimpan lead dari form konsultasi singkat, lalu mengembalikan URL WhatsApp berisi pesan terisi. Lead wajib tersimpan sebelum redirect (FR-04, FR-05, DEC-003, NFR-05). Rate limit diterapkan (NFR-07; mekanisme TBD).

**Auth/Role:** Public

**Request Body**

```json
{
  "name": "Budi",
  "phone": "081234567890",
  "deviceType": "Xiaomi Redmi Note 10",
  "complaint": "Bootloop setelah update sistem",
  "serviceId": "clxservice123"
}
```

`serviceId` opsional; bila diisi harus merujuk `Service.id` yang valid. `name`, `phone`, `deviceType`, dan `complaint` wajib diisi dan tidak boleh string kosong. `phone` dinormalisasi ke format `62…`; nomor yang tidak lolos validasi mengembalikan `422`.

**Response Body — 201**

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "clxlead123",
      "name": "Budi",
      "phone": "6281234567890",
      "deviceType": "Xiaomi Redmi Note 10",
      "complaint": "Bootloop setelah update sistem",
      "serviceId": "clxservice123",
      "status": "NEW",
      "createdAt": "2026-01-01T10:00:00.000Z"
    },
    "whatsappUrl": "https://wa.me/62xxxxxxxxxx?text=PESAN_PRATEXT_TBD"
  }
}
```

Pesan prateks WhatsApp dan nomor resmi masih TBD (PRD §9); keduanya diambil dari `SiteSetting` dan konfigurasi admin. Bila `whatsappNumber` bernilai `NULL`, endpoint mengembalikan `503 WHATSAPP_NOT_CONFIGURED` dan tidak membuat lead.

**Status Codes:** `201`, `422`, `429`, `503`, `500`

### GET /api/v1/services

**Description:** Menampilkan katalog layanan `isPublished = true` dengan filter kategori (FR-02, FR-09). Harga yang dikembalikan hanya label `priceFromLabel`, bukan nominal pasti (DEC-002).

**Auth/Role:** Public

**Query Parameters**

| Parameter | Wajib | Keterangan |
|:---|:---|:---|
| `category` | Tidak | Filter `Service.category` |
| `page` | Tidak | Halaman paginasi |
| `perPage` | Tidak | Jumlah item per halaman; batas TBD |

**Response Body — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxservice123",
      "name": "Root",
      "slug": "root",
      "category": "Software",
      "priceFromLabel": "mulai dari Rp50.000",
      "icon": "IconBrandAndroid",
      "sortOrder": 1
    }
  ],
  "meta": { "page": 1, "perPage": 20, "total": 1, "totalPages": 1 }
}
```

**Status Codes:** `200`, `422`, `500`

### GET /api/v1/services/{slug}

**Description:** Detail layanan publik berdasarkan slug, termasuk gejala, persiapan pelanggan, dan CTA konsultasi (FR-03, DEC-001).

**Auth/Role:** Public

**Response Body — 200**

```json
{
  "success": true,
  "data": {
    "id": "clxservice123",
    "name": "Bootloop",
    "slug": "bootloop",
    "category": "Software",
    "description": "Penanganan perangkat yang berhenti di logo atau restart berulang.",
    "symptoms": ["Berhenti di logo", "Restart berulang"],
    "preparation": ["Membawa USB sesuai device", "Menyiapkan informasi akun device"],
    "priceFromLabel": "mulai dari Rp50.000",
    "icon": "IconRefreshAlert",
    "sortOrder": 2
  }
}
```

Layanan `isPublished = false` diperlakukan sebagai tidak ditemukan. `preparation` mengikuti DEC-001; teks final tiap layanan TBD.

**Status Codes:** `200`, `404`, `500`

### PATCH /api/v1/admin/leads/{id}

**Description:** Memperbarui status lead, catatan internal, jadwal follow-up, dan/atau harga kesepakatan (FR-13, DEC-004). Saat status pertama kali berubah menjadi `CONTACTED`, isi `contactedAt` (DATABASE.md §3.2). Setiap perubahan yang dikirim dicatat sebagai `LeadActivity` pada transaksi yang sama.

**Auth/Role:** Admin

**Request Body**

```json
{
  "status": "CONTACTED",
  "adminNote": "Sudah dihubungi via WhatsApp, menunggu konfirmasi jadwal.",
  "nextFollowUpAt": "2026-01-03T10:00:00.000Z",
  "agreedPrice": 150000
}
```

Minimal satu field harus dikirim. `status` harus salah satu dari `NEW`, `CONTACTED`, `SCHEDULED`, `DONE`, `CANCELLED`. `nextFollowUpAt` berupa ISO 8601 atau `null` untuk menghapus jadwal. `agreedPrice` bilangan bulat ≥ 0 atau `null` untuk menghapus; nilainya internal dan tidak pernah dirender di halaman publik (DEC-002). `contactedAt` tidak boleh diubah langsung oleh client.

**Response Body — 200**

```json
{
  "success": true,
  "data": {
    "id": "clxlead123",
    "name": "Budi",
    "phone": "6281234567890",
    "deviceType": "Xiaomi Redmi Note 10",
    "complaint": "Bootloop setelah update sistem",
    "serviceId": "clxservice123",
    "status": "CONTACTED",
    "adminNote": "Sudah dihubungi via WhatsApp, menunggu konfirmasi jadwal.",
    "agreedPrice": 150000,
    "nextFollowUpAt": "2026-01-03T10:00:00.000Z",
    "contactedAt": "2026-01-01T10:15:00.000Z",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:15:00.000Z",
    "activities": [
      {
        "id": "clxactivity123",
        "kind": "STATUS",
        "message": "Status: NEW → CONTACTED",
        "createdAt": "2026-01-01T10:15:00.000Z"
      }
    ]
  }
}
```

**Status Codes:** `200`, `401`, `403`, `404`, `422`, `500`

### DELETE /api/v1/admin/leads/{id}

**Description:** Menghapus permanen satu lead beserta seluruh `LeadActivity`-nya (onDelete Cascade). Dipakai untuk permintaan penghapusan data pribadi.

**Auth/Role:** Admin

**Response Body — 200**

```json
{ "success": true, "data": { "id": "clxlead123" } }
```

**Status Codes:** `200`, `401`, `404`, `500`

### GET /api/v1/admin/leads/export

**Description:** Mengunduh seluruh lead sebagai CSV (UTF-8 dengan BOM agar terbaca Excel). Kolom: ID, Nama, WhatsApp, Device, Keluhan, Layanan, Status, Harga Kesepakatan, Follow-up, Masuk, Pertama Dihubungi, Catatan Admin.

**Auth/Role:** Admin

**Response:** `200` dengan `Content-Type: text/csv; charset=utf-8` dan `Content-Disposition: attachment`.

**Status Codes:** `200`, `401`, `500`

### POST /api/v1/admin/testimonials

**Description:** Menambahkan testimoni dari dashboard admin (FR-15, DEC-005). Tidak ada endpoint testimoni publik; testimoni hanya dibuat admin.

**Auth/Role:** Admin

**Request Body**

```json
{
  "customerName": "Sari",
  "deviceType": "Samsung Galaxy A52",
  "review": "Perangkat berhasil normal kembali dan komunikasinya jelas.",
  "rating": 5,
  "isPublished": true
}
```

`rating` wajib bilangan bulat 1–5. `isPublished` opsional; default `false` sesuai DATABASE.md.

**Response Body — 201**

```json
{
  "success": true,
  "data": {
    "id": "clxtesti123",
    "customerName": "Sari",
    "deviceType": "Samsung Galaxy A52",
    "review": "Perangkat berhasil normal kembali dan komunikasinya jelas.",
    "rating": 5,
    "isPublished": true,
    "createdAt": "2026-01-01T11:00:00.000Z",
    "updatedAt": "2026-01-01T11:00:00.000Z"
  }
}
```

**Status Codes:** `201`, `401`, `403`, `422`, `500`

## 4. Not covered in this tier

Endpoint berikut dibutuhkan oleh FR-XX terkait, tetapi tidak dirinci pada tier ini:

| Endpoint | FR | Catatan |
|:---|:---|:---|
| `GET /api/v1/admin/leads` | FR-13 | Daftar lead + filter status + paginasi |
| `POST /api/v1/admin/services` | FR-12 | Buat layanan |
| `PATCH /api/v1/admin/services/{id}` | FR-12 | Ubah / publikasikan layanan |
| `DELETE /api/v1/admin/services/{id}` | FR-12 | Hapus layanan |
| `GET /api/v1/articles` | FR-06 | Daftar artikel `published` |
| `GET /api/v1/articles/{slug}` | FR-06 | Detail artikel |
| `POST /api/v1/admin/articles` | FR-14 | Buat artikel / draft |
| `PATCH /api/v1/admin/articles/{id}` | FR-14 | Ubah / publikasikan artikel |
| `PATCH /api/v1/admin/testimonials/{id}` | FR-15 | Ubah / publikasikan testimoni |
| `DELETE /api/v1/admin/testimonials/{id}` | FR-15 | Hapus testimoni |
| `GET /api/v1/admin/dashboard/summary` | FR-11 | Ringkasan jumlah lead baru, layanan, artikel, testimoni |
| `PUT /api/v1/admin/site-settings` | FR-17 | Nomor WhatsApp, label harga minimum, identitas brand |
| `/api/auth/*` | FR-10 | Dikelola Better Auth; bukan endpoint kustom |
| UploadThing upload route | FR-16 | Dikelola UploadThing; URL disimpan pada field terkait |