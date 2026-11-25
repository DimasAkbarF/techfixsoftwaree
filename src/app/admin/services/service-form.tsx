"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createServiceAction, updateServiceAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { AVAILABLE_ICONS, ServiceIcon } from "@/components/common/service-icon";
import {
  IconDeviceFloppy,
  IconLoader2,
  IconArrowLeft,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";

interface ServiceInitialData {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  symptoms: string[];
  preparation: string[];
  priceFromLabel: string;
  icon: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export function ServiceForm({
  initialData,
}: {
  initialData?: ServiceInitialData;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = React.useState<string>(
    initialData?.icon || "IconTool"
  );
  const [name, setName] = React.useState(initialData?.name || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");

  // Auto-generate slug when name changes if creating new
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing && !initialData) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("slug", slug);

    const result = isEditing
      ? await updateServiceAction(initialData!.id!, formData)
      : await createServiceAction(formData);

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error?.message || "Gagal menyimpan layanan.");
      return;
    }

    router.push("/admin/services");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Layanan</span>
        </Link>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
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
              {isEditing ? "Perbarui Layanan" : "Simpan Layanan"}
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

      {/* Informasi Utama */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Informasi Utama
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Layanan *</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Contoh: Bootloop / Stuck Logo"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug URL *</Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="contoh: bootloop-stuck-logo"
            />
            <p className="text-xs text-[var(--color-muted)]">
              Dipakai pada URL detail `/services/{slug}`. Wajib unik.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori *</Label>
            <Input
              id="category"
              name="category"
              required
              defaultValue={initialData?.category || "Software"}
              placeholder="Contoh: Bootloop, Flashing, Root"
            />
            <p className="text-xs text-[var(--color-muted)]">
              Digunakan untuk filter kategori katalog (FR-09).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icon">Ikon (@tabler/icons-react)</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius)] border border-[var(--color-border)] flex items-center justify-center bg-[#F9FAFB] shrink-0">
                <ServiceIcon name={selectedIcon} className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <select
                id="icon"
                name="icon"
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value)}
                className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                {AVAILABLE_ICONS.map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi Layanan *</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={initialData?.description || ""}
            placeholder="Penjelasan detail penanganan perbaikan software untuk masalah ini..."
          />
        </div>
      </div>

      {/* Gejala & Persiapan Pelanggan */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Detail Masalah & Instruksi Pelanggan
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="symptoms">Gejala Kerusakan (1 per baris)</Label>
          <Textarea
            id="symptoms"
            name="symptoms"
            rows={3}
            defaultValue={initialData?.symptoms?.join("\n") || ""}
            placeholder="Contoh:&#10;Perangkat berhenti di logo brand&#10;Restart berulang secara tiba-tiba&#10;Gagal masuk ke sistem setelah update"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Tampil di halaman detail layanan sebagai ciri-ciri kerusakan.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preparation">Persiapan Pelanggan (1 per baris - DEC-001)</Label>
          <Textarea
            id="preparation"
            name="preparation"
            rows={3}
            defaultValue={
              initialData?.preparation?.join("\n") ||
              "Membawa USB sesuai device\nMenyiapkan informasi akun Google/Mi Account yang terhubung"
            }
            placeholder="Contoh:&#10;Membawa USB sesuai device&#10;Menyiapkan informasi akun"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Instruksi yang perlu disiapkan oleh pelanggan saat konsultasi atau datang offline.
          </p>
        </div>
      </div>

      {/* Harga & Publikasi */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)] space-y-4">
        <h2 className="font-heading text-base font-semibold border-b border-[var(--color-border)] pb-2">
          Ketentuan Harga & Publikasi
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="priceFromLabel">Teks Label Harga Mulai Dari (DEC-002) *</Label>
          <Input
            id="priceFromLabel"
            name="priceFromLabel"
            required
            defaultValue={initialData?.priceFromLabel || "mulai dari Rp50.000"}
            placeholder="mulai dari Rp50.000"
          />
          <p className="text-xs text-[var(--color-warning)] font-medium">
            Aturan: TIDAK BOLEH memasukkan angka harga pasti. Hanya teks representatif awal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Urutan Tampil (Sort Order)</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={initialData?.sortOrder ?? 0}
            />
            <p className="text-xs text-[var(--color-muted)]">
              Angka lebih kecil tampil lebih dulu di katalog publik.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={initialData?.isPublished ?? false}
              className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Publikasikan di katalog publik
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/services">
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
              {isEditing ? "Perbarui Layanan" : "Simpan Layanan"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
