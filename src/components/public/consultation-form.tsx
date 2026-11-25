"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  IconBrandWhatsapp,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";

interface ConsultationFormProps {
  serviceId?: string;
  serviceName?: string;
  whatsappConfigured?: boolean;
  headingAs?: "h2" | "h3";
}

export function ConsultationForm({
  serviceId,
  serviceName,
  whatsappConfigured = true,
  headingAs = "h3",
}: ConsultationFormProps) {
  const Heading = headingAs;
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [deviceType, setDeviceType] = React.useState("");
  const [complaint, setComplaint] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [redirectUrl, setRedirectUrl] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappConfigured) return;

    setLoading(true);
    setErrorMsg(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          deviceType,
          complaint,
          serviceId: serviceId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoading(false);
        if (data.error?.code === "VALIDATION_ERROR" && data.error.details) {
          const errors: Record<string, string> = {};
          data.error.details.forEach((d: { field: string; message: string }) => {
            errors[d.field] = d.message;
          });
          setFieldErrors(errors);
        }
        setErrorMsg(data.error?.message || "Gagal memproses konsultasi.");
        return;
      }

      // Success: Lead saved in DB! Now redirect to WhatsApp
      setRedirectUrl(data.data.whatsappUrl);
      window.location.href = data.data.whatsappUrl;
    } catch {
      setLoading(false);
      setErrorMsg("Koneksi gagal. Pastikan jaringan internet Anda aktif.");
    }
  };

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-6 rounded-[var(--radius)]">
      <div className="mb-5">
        <Heading className="font-heading text-lg font-bold text-[var(--color-primary)]">
          Form Konsultasi Servis
        </Heading>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          {serviceName
            ? `Konsultasi khusus untuk penanganan: ${serviceName}`
            : "Ceritakan kendala perangkat Android Anda untuk konsultasi langsung via WhatsApp."}
        </p>
      </div>

      {!whatsappConfigured && (
        <Alert variant="warning" className="mb-4">
          <IconAlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Nomor WhatsApp konsultasi sedang dalam konfigurasi admin. Form dinonaktifkan sementara.
          </span>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="danger" className="mb-4">
          <IconAlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </Alert>
      )}

      {redirectUrl && (
        <div className="mb-4 p-4 border border-[#CEEAD6] bg-[#E6F4EA] rounded-[var(--radius)] text-sm space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-success)] font-medium">
            <IconCheck className="w-5 h-5" />
            <span>Data konsultasi tersimpan! Mengarahkan ke WhatsApp...</span>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Jika WhatsApp tidak terbuka otomatis:
          </p>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            <span>Buka WhatsApp Sekarang</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lead-name">Nama Anda *</Label>
          <Input
            id="lead-name"
            required
            placeholder="Contoh: Budi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || !whatsappConfigured}
          />
          {fieldErrors.name && (
            <p className="text-xs text-[var(--color-danger)]">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">Nomor WhatsApp *</Label>
          <Input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading || !whatsappConfigured}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-[var(--color-danger)]">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-device">Tipe Perangkat Android *</Label>
          <Input
            id="lead-device"
            required
            placeholder="Contoh: Xiaomi Redmi Note 10 Pro / Samsung A52"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            disabled={loading || !whatsappConfigured}
          />
          {fieldErrors.deviceType && (
            <p className="text-xs text-[var(--color-danger)]">{fieldErrors.deviceType}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-complaint">Keluhan / Gejala Kerusakan *</Label>
          <Textarea
            id="lead-complaint"
            required
            rows={3}
            placeholder="Contoh: Tiba-tiba mati dan stuck di logo setelah update sistem..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            disabled={loading || !whatsappConfigured}
          />
          {fieldErrors.complaint && (
            <p className="text-xs text-[var(--color-danger)]">{fieldErrors.complaint}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full gap-2 mt-2"
          disabled={loading || !whatsappConfigured}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <IconLoader2 className="w-4 h-4 animate-spin" />
              Menyimpan & Menghubungkan...
            </>
          ) : (
            <>
              <IconBrandWhatsapp className="w-5 h-5" />
              Lanjut Konsultasi WhatsApp
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-[var(--color-muted)] leading-relaxed">
          Kesepakatan harga final dilakukan personal via WhatsApp. Tanpa toko fisik.
        </p>
      </form>
    </div>
  );
}
