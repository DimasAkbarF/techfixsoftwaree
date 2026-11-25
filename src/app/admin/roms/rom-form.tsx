"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRomAction, updateRomAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  IconDeviceFloppy,
  IconLoader2,
  IconArrowLeft,
  IconAlertCircle,
} from "@tabler/icons-react";

interface RomInitialData {
  id?: string;
  name: string;
  logoUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

export function RomForm({ initialData }: { initialData?: RomInitialData }) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(initialData?.logoUrl || null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!logoUrl) {
      setErrorMsg("Logo ROM wajib diunggah atau diisi URL-nya.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", logoUrl);

    const result = isEditing
      ? await updateRomAction(initialData!.id!, formData)
      : await createRomAction(formData);

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error?.message || "Gagal menyimpan ROM.");
      return;
    }

    router.push("/admin/roms");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <Link
          href="/admin/roms"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar ROM</span>
        </Link>
        <Button type="submit" variant="secondary" size="sm" className="gap-2" disabled={loading}>
          {loading ? (
            <>
              <IconLoader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="w-4 h-4" />
              {isEditing ? "Perbarui ROM" : "Simpan ROM"}
            </>
          )}
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="danger">
          <IconAlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </Alert>
      )}

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Identitas ROM
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nama ROM *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={initialData?.name || ""}
            placeholder="Contoh: LineageOS"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Tampil sebagai label di samping logo pada beranda.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Logo ROM *</Label>
          <ImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            label="Unggah Logo ROM"
            helperText="Gunakan gambar persegi (minimal 96×96 px), format PNG/JPG/WEBP maks 4MB."
          />
        </div>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Urutan & Publikasi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Urutan Tampil</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={initialData?.sortOrder ?? 0}
            />
            <p className="text-xs text-[var(--color-muted)]">
              Angka lebih kecil tampil lebih dulu di pita beranda.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={initialData?.isPublished ?? true}
              className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Tampilkan di beranda
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/roms">
          <Button variant="outline" type="button">
            Batal
          </Button>
        </Link>
        <Button variant="secondary" type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <IconLoader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="w-4 h-4" />
              {isEditing ? "Perbarui ROM" : "Simpan ROM"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
