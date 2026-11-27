"use client";

import * as React from "react";
import Link from "next/link";
import { normalizePhone } from "@/lib/phone";
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";

const BRANDS = [
  "Xiaomi / Redmi / Poco",
  "Samsung Galaxy",
  "Infinix / Tecno",
  "Realme / Oppo",
  "Vivo / iQOO",
  "Google Pixel",
  "Asus ROG / Zenfone",
  "Merek Android Lainnya",
] as const;

interface SymptomOption {
  id: string;
  label: string;
  hint: string;
  serviceSlug: string;
  serviceName: string;
  dataNote: string;
  checklist: string[];
}

const SYMPTOMS: SymptomOption[] = [
  {
    id: "bootloop",
    label: "Bootloop / Stuck Logo / Restart Terus",
    hint: "HP menyala tapi mentok di logo atau terus restart.",
    serviceSlug: "fix-bootloop",
    serviceName: "Perbaikan Bootloop & Stuck Logo",
    dataNote:
      "Kami mengupayakan metode tanpa hapus data bila partisi masih sehat; bila partisi rusak, risiko reset dijelaskan dulu sebelum eksekusi.",
    checklist: [
      "Catat apa yang terjadi sebelum bootloop (update OTA, memori penuh, atau gagal modul).",
      "Siapkan kabel USB data yang stabil dan baterai minimal 40%.",
    ],
  },
  {
    id: "unbrick",
    label: "Mati Total / Hardbrick / Deteksi 9008 / BROM",
    hint: "Layar gelap tidak merespons, hanya getar atau terbaca port EDL/MTK di PC.",
    serviceSlug: "unbrick",
    serviceName: "Unbrick Android (Hardbrick / Softbrick)",
    dataNote:
      "Pemulihan hardbrick/EDL umumnya memicu factory reset demi mengembalikan partisi sistem agar menyala normal kembali.",
    checklist: [
      "Sambungkan HP ke PC Windows untuk cek apakah port Qualcomm 9008 / MediaTek Preloader terbaca.",
      "Pastikan bukan kerusakan fisik (jatuh keras, kena air, atau baterai soak).",
    ],
  },
  {
    id: "fastboot",
    label: "Stuck Fastboot / The System Has Been Destroyed",
    hint: "Mentok di layar Fastboot, Recovery, atau pesan system destroyed.",
    serviceSlug: "flash-firmware",
    serviceName: "Flash Firmware Resmi (Stock ROM)",
    dataNote:
      "Tergantung status bootloader & kerusakan partisi; opsi tanpa hapus data dicek terlebih dahulu sebelum flashing.",
    checklist: [
      "Siapkan tipe lengkap perangkat (contoh: Redmi Note 12 / Poco X5 Pro).",
      "Koneksi internet stabil untuk unduh firmware resmi sesuai region.",
    ],
  },
  {
    id: "root",
    label: "Ingin Root (Magisk / KernelSU / APatch) atau UBL",
    hint: "Akses superuser systemless bersih, hapus bloatware, atau buka bootloader.",
    serviceSlug: "root-android",
    serviceName: "Root Android & Unlock Bootloader",
    dataNote:
      "Root pada HP yang sudah UBL TIDAK menghapus data. Jika masih terkunci dan perlu UBL dulu, prosedur OEM otomatis mereset data internal (wajib backup).",
    checklist: [
      "Cek apakah status OEM Unlocking / Mi Unlock sudah aktif.",
      "Pahami dampak root pada aplikasi perbankan/e-wallet sebelum eksekusi.",
    ],
  },
  {
    id: "custom-rom",
    label: "Pasang Custom ROM / TWRP / OrangeFox",
    hint: "Upgrade OS lebih ringan & bebas iklan (LineageOS, PixelOS, Evolution X, crDroid).",
    serviceSlug: "custom-rom",
    serviceName: "Pemasangan Custom ROM & Custom Recovery",
    dataNote:
      "Pemasangan Custom ROM memerlukan clean flash (data internal terhapus), jadi backup foto & chat penting lebih dulu.",
    checklist: [
      "Pastikan bootloader sudah UBL atau siap di-unlock terlebih dahulu.",
      "Sampaikan prioritas Anda (baterai awet, performa gaming, atau tampilan Pixel bersih).",
    ],
  },
  {
    id: "software-other",
    label: "Bypass FRP / Downgrade OS / Error Software Lainnya",
    hint: "Lupa akun Google setelah reset, ingin turun versi Android, atau bug sistem.",
    serviceSlug: "software-repair",
    serviceName: "Perbaikan Software Android",
    dataNote:
      "Keamanan data bergantung jenis tindakan (downgrade biasanya reset data); teknisi akan menjelaskan sebelum mulai.",
    checklist: [
      "Siapkan kronologi singkat dan versi Android/OS saat ini jika masih bisa dilihat.",
      "Sertakan foto layar error saat konsultasi WhatsApp.",
    ],
  },
];

const MODES = [
  {
    id: "remote",
    label: "Punya PC / Laptop Windows + Kabel USB",
    detail: "Servis jarak jauh (remote seluruh Indonesia via AnyDesk / UltraViewer / TeamViewer).",
    waLabel: "Remote online (punya PC Windows + kabel USB)",
  },
  {
    id: "offline",
    label: "Tidak Punya PC / Ingin Tatap Muka",
    detail: "Perjanjian tatap muka area Rangkasbitung & Jabodetabek (menyesuaikan lokasi + ongkir).",
    waLabel: "Tatap muka / offline (tanpa PC, butuh perjanjian lokasi)",
  },
] as const;

export function QuickDiagnosis({
  whatsappNumber,
  minPriceLabel = "mulai dari Rp50.000",
}: {
  whatsappNumber: string | null;
  minPriceLabel?: string;
}) {
  const [brand, setBrand] = React.useState<string>("");
  const [symptomId, setSymptomId] = React.useState<string>("");
  const [modeId, setModeId] = React.useState<(typeof MODES)[number]["id"] | "">("");

  const symptom = SYMPTOMS.find((s) => s.id === symptomId) ?? null;
  const mode = MODES.find((m) => m.id === modeId) ?? null;
  const ready = Boolean(brand && symptom && mode);

  const cleanWa = whatsappNumber?.trim() ? normalizePhone(whatsappNumber) : "";
  const whatsappUrl =
    ready && cleanWa.length >= 10
      ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(
          `Halo TechFixSoftware, hasil diagnosa cepat saya:\n- Merek HP: ${brand}\n- Gejala: ${symptom!.label}\n- Metode: ${mode!.waLabel}\n\nMohon info penanganan & estimasi biayanya.`
        )}`
      : null;

  const reset = () => {
    setBrand("");
    setSymptomId("");
    setModeId("");
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Merek */}
      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">
              Langkah 01
            </span>
            <h2 className="mt-0.5 font-heading text-lg font-bold text-[var(--color-primary)]">
              Pilih merek perangkat Android Anda
            </h2>
          </div>
          {brand && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
              <IconCheck className="h-3.5 w-3.5" />
              Dipilih
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {BRANDS.map((item) => {
            const active = brand === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setBrand(item)}
                className={`cursor-pointer rounded-[var(--radius)] border px-3 py-2.5 text-left text-xs font-semibold transition-colors sm:text-sm ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:border-[var(--color-accent)]/60 hover:bg-[#eaf2ef]/60"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Gejala */}
      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">
              Langkah 02
            </span>
            <h2 className="mt-0.5 font-heading text-lg font-bold text-[var(--color-primary)]">
              Kendala apa yang sedang dialami?
            </h2>
          </div>
          {symptom && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
              <IconCheck className="h-3.5 w-3.5" />
              Dipilih
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {SYMPTOMS.map((item) => {
            const active = symptomId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSymptomId(item.id)}
                className={`cursor-pointer rounded-[var(--radius)] border p-3.5 text-left transition-colors ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:border-[var(--color-accent)]/60 hover:bg-[#eaf2ef]/60"
                }`}
              >
                <div className="text-sm font-bold">{item.label}</div>
                <div className={`mt-1 text-xs leading-relaxed ${active ? "text-white/80" : "text-[var(--color-muted)]"}`}>
                  {item.hint}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Ketersediaan PC / Metode */}
      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">
              Langkah 03
            </span>
            <h2 className="mt-0.5 font-heading text-lg font-bold text-[var(--color-primary)]">
              Ketersediaan PC / Laptop Windows
            </h2>
          </div>
          {mode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
              <IconCheck className="h-3.5 w-3.5" />
              Dipilih
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.map((item) => {
            const active = modeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setModeId(item.id)}
                className={`cursor-pointer rounded-[var(--radius)] border p-4 text-left transition-colors ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:border-[var(--color-accent)]/60 hover:bg-[#eaf2ef]/60"
                }`}
              >
                <div className="text-sm font-bold">{item.label}</div>
                <div className={`mt-1 text-xs leading-relaxed ${active ? "text-white/80" : "text-[var(--color-muted)]"}`}>
                  {item.detail}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hasil Rekomendasi */}
      {ready && symptom && mode && (
        <section
          aria-live="polite"
          className="rounded-[var(--radius)] border border-[#0F766E]/35 bg-[#0b1220] p-6 text-white shadow-[0_18px_44px_-24px_rgba(11,18,32,0.65)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#34d399]">
                Hasil Diagnosa Cepat
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold text-white">
                Rekomendasi: {symptom.serviceName}
              </h3>
              <p className="mt-1 text-xs text-white/75">
                {brand} &middot; {mode.label} &middot; Estimasi awal{" "}
                <span className="font-mono font-semibold text-[#6EE7B7]">{minPriceLabel}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius)] border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <IconRefresh className="h-3.5 w-3.5" />
              Ulangi
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#34d399]">
                <IconShieldCheck className="h-4 w-4" />
                <span>Catatan Keamanan Data</span>
              </div>
              <p className="text-sm leading-relaxed text-white/80">{symptom.dataNote}</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#34d399]">
                Persiapan Sebelum Konsultasi
              </div>
              <ul className="space-y-1.5 text-sm text-white/80">
                {symptom.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[image:var(--cta-gradient)] px-5 text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105"
              >
                <IconBrandWhatsapp className="h-5 w-5" />
                <span>Kirim Hasil Diagnosa ke WhatsApp</span>
              </a>
            ) : (
              <Link
                href="/#konsultasi"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[image:var(--cta-gradient)] px-5 text-sm font-bold text-[#041a14] shadow-[var(--cta-shadow)] transition-all hover:brightness-105"
              >
                <span>Lanjut ke Form Konsultasi</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href={`/services/${symptom.serviceSlug}`}
              prefetch={true}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <span>Baca Detail Layanan</span>
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
