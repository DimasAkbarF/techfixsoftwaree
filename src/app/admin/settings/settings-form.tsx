"use client";

import * as React from "react";
import { updateSiteSetting, type SiteSettingData } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { ImageUpload } from "@/components/admin/image-upload";
import { IconDeviceFloppy, IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";

export function SettingsForm({ initialData }: { initialData: SiteSettingData }) {
  const [loading, setLoading] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(initialData.logoUrl || null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateSiteSetting(formData);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error?.message || "Gagal menyimpan pengaturan situs.");
    } else {
      setSuccessMsg("Pengaturan situs berhasil diperbarui.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {errorMsg && (
        <Alert variant="danger">
          <IconAlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success">
          <IconCheck className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </Alert>
      )}

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-5">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-3">
          Identitas Brand & Kontak
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="brandName">Nama Brand</Label>
          <Input
            id="brandName"
            name="brandName"
            defaultValue={initialData.brandName}
            required
            placeholder="TechFixSoftware"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Nama brand yang ditampilkan di header, metadata, dan komunikasi website.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Logo Brand (UploadThing)</Label>
          <input type="hidden" name="logoUrl" value={logoUrl || ""} />
          <ImageUpload
            value={logoUrl}
            onChange={(url) => setLogoUrl(url)}
            label="Unggah Logo Brand"
            helperText="Unggah logo resmi berformat PNG transparan, JPG, atau WEBP."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber">Nomor WhatsApp Admin (Format Internasional)</Label>
          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={initialData.whatsappNumber || ""}
            placeholder="628123456789"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Nomor tujuan redirect lead konsultasi. Jika kosong, tombol CTA WhatsApp di website publik dinonaktifkan (503 WHATSAPP_NOT_CONFIGURED). Kosongkan untuk menyimpan sebagai NULL.
          </p>
        </div>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-5">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-3">
          Kebijakan Tampilan Harga (DEC-002)
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="minPriceLabel">Teks Label Harga Minimum</Label>
          <Input
            id="minPriceLabel"
            name="minPriceLabel"
            defaultValue={initialData.minPriceLabel}
            required
            placeholder="mulai dari Rp50.000"
          />
          <div className="p-3 bg-[#FEF7E0] border border-[#FEEFC3] rounded-[var(--radius)] text-xs text-[var(--color-warning)]">
            <strong>Aturan Mutlak DEC-002:</strong> Website TIDAK BOLEH menampilkan nominal harga pasti. Label ini adalah teks representasi umum untuk katalog servis. Kesepakatan harga final dilakukan personal lewat WhatsApp.
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="secondary"
          className="gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <IconLoader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
