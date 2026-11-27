"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { isValidWhatsappNumber } from "@/lib/phone";
import {
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconDeviceMobile,
  IconLoader2,
  IconSearch,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";

type LeadStatusValue = "NEW" | "CONTACTED" | "SCHEDULED" | "DONE" | "CANCELLED";

interface TrackedLead {
  ticketCode: string;
  deviceType: string;
  serviceName: string;
  serviceSlug: string | null;
  status: LeadStatusValue;
  createdAt: string;
  contactedAt: string | null;
  nextFollowUpAt: string | null;
  updatedAt: string;
  activities: Array<{
    id: string;
    kind: string;
    message: string;
    createdAt: string;
  }>;
}

const TIMELINE_STEPS: Array<{
  key: Exclude<LeadStatusValue, "CANCELLED">;
  label: string;
  description: string;
}> = [
  {
    key: "NEW",
    label: "Tiket Diterima",
    description: "Permintaan konsultasi atau servis Anda telah masuk ke antrean teknisi.",
  },
  {
    key: "CONTACTED",
    label: "Sudah Dihubungi",
    description: "Teknisi sudah menghubungi Anda via WhatsApp untuk analisa awal.",
  },
  {
    key: "SCHEDULED",
    label: "Dijadwalkan",
    description: "Sesi remote (AnyDesk/USB) atau pertemuan langsung sudah disepakati.",
  },
  {
    key: "DONE",
    label: "Selesai",
    description: "Pengerjaan software telah selesai dan perangkat siap digunakan kembali.",
  },
];

const STATUS_INDEX: Record<Exclude<LeadStatusValue, "CANCELLED">, number> = {
  NEW: 0,
  CONTACTED: 1,
  SCHEDULED: 2,
  DONE: 3,
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ServiceTracker({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const [ticketCode, setTicketCode] = React.useState("");
  const [phoneLast4, setPhoneLast4] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TrackedLead | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get("ticket");
    if (ticket) {
      setTicketCode(ticket.trim().toUpperCase().slice(0, 32));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);

    const cleanedTicket = ticketCode.trim();
    const cleanedPhone = phoneLast4.replace(/\D/g, "").slice(-4);

    if (cleanedTicket.length < 6) {
      setErrorMsg("Masukkan kode tiket minimal 6 karakter (contoh: A9F3K2).");
      return;
    }
    if (!/^\d{4}$/.test(cleanedPhone)) {
      setErrorMsg("Masukkan tepat 4 digit terakhir nomor WhatsApp Anda.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/leads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode: cleanedTicket,
          phoneLast4: cleanedPhone,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Tiket servis tidak ditemukan.");
      } else {
        setResult(json.data as TrackedLead);
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const validWa = whatsappNumber && isValidWhatsappNumber(whatsappNumber) ? whatsappNumber : null;
  const waUrl =
    validWa && result
      ? `https://wa.me/${validWa}?text=${encodeURIComponent(
          `Halo TechFixSoftware, saya ingin menanyakan progres tiket servis #${result.ticketCode} (${result.deviceType}).`
        )}`
      : null;

  const activeIndex =
    result && result.status !== "CANCELLED" ? STATUS_INDEX[result.status] : -1;

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-12 sm:items-end">
          <div className="space-y-1.5 sm:col-span-5">
            <Label htmlFor="ticket-code">Kode Tiket Servis</Label>
            <Input
              id="ticket-code"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              placeholder="Contoh: A9F3K2"
              autoComplete="off"
              className="font-mono uppercase tracking-wider"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-4">
            <Label htmlFor="phone-last4">4 Digit Terakhir Nomor WA</Label>
            <Input
              id="phone-last4"
              value={phoneLast4}
              onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Contoh: 8910"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              className="font-mono tracking-widest"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconSearch className="h-4 w-4" />
              )}
              <span>{loading ? "Memeriksa..." : "Cek Status"}</span>
            </Button>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <IconShieldCheck className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <span>
            Verifikasi 4 digit terakhir nomor WhatsApp menjaga agar progres servis Anda tidak bisa dilihat orang lain.
          </span>
        </p>

        {errorMsg && (
          <div className="mt-4">
            <Alert variant="danger">
              <span>{errorMsg}</span>
            </Alert>
          </div>
        )}
      </form>

      {result && (
        <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Tiket #{result.ticketCode}
              </span>
              <h2 className="mt-1 flex items-center gap-2 font-heading text-xl font-bold text-[var(--color-primary)]">
                <IconDeviceMobile className="h-5 w-5 text-[var(--color-accent)]" />
                <span>{result.deviceType}</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Layanan:{" "}
                {result.serviceSlug ? (
                  <Link
                    href={`/services/${result.serviceSlug}`}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {result.serviceName}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--color-primary)]">
                    {result.serviceName}
                  </span>
                )}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-[var(--color-muted)] space-y-1">
              <div className="inline-flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5" />
                <span>Masuk: {formatDateTime(result.createdAt)}</span>
              </div>
              {result.nextFollowUpAt && result.status !== "DONE" && result.status !== "CANCELLED" && (
                <div className="flex items-center sm:justify-end gap-1.5 font-medium text-[var(--color-primary)]">
                  <IconCalendarEvent className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  <span>Jadwal: {formatDateTime(result.nextFollowUpAt)}</span>
                </div>
              )}
            </div>
          </div>

          {result.status === "CANCELLED" ? (
            <div className="flex items-start gap-3 rounded-[var(--radius)] border border-red-200 bg-red-50/70 p-4 text-sm text-red-900">
              <IconX className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold">Tiket Dibatalkan</p>
                <p className="mt-0.5 text-xs text-red-800">
                  Permintaan servis ini berstatus batal. Jika ingin menjadwalkan ulang, silakan hubungi kami kembali melalui WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <ol className="grid gap-4 sm:grid-cols-4">
              {TIMELINE_STEPS.map((step, index) => {
                const isDone = index <= activeIndex;
                const isCurrent = index === activeIndex;
                return (
                  <li
                    key={step.key}
                    className={`rounded-[var(--radius)] border p-4 transition-colors ${
                      isCurrent
                        ? "border-[var(--color-accent)] bg-emerald-50/40"
                        : isDone
                          ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                          : "border-[var(--color-border)]/70 bg-[#F9FAFB] opacity-65"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-[var(--color-accent)] text-[#04231c]"
                            : "bg-[var(--color-border)] text-[var(--color-muted)]"
                        }`}
                      >
                        {isDone ? <IconCheck className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <span className="font-heading text-sm font-bold text-[var(--color-primary)]">
                        {step.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          {result.activities.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-5">
              <h3 className="font-heading text-sm font-bold text-[var(--color-primary)]">
                Riwayat Progres
              </h3>
              <ul className="mt-3 space-y-2.5">
                {result.activities.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-[var(--radius)] border border-[var(--color-border)]/70 bg-[#F9FAFB] px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-medium text-[var(--color-fg)]">
                      {activity.message}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--color-muted)] shrink-0">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {waUrl && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5">
              <p className="text-xs text-[var(--color-muted)]">
                Ada pertanyaan tambahan soal pengerjaan perangkat Anda?
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[#15803D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#166534]"
              >
                <IconBrandWhatsapp className="h-4 w-4" />
                <span>Tanya Teknisi via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
