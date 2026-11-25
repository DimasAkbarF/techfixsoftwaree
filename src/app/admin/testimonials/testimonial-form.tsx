"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createTestimonialAction, updateTestimonialAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  IconDeviceFloppy,
  IconLoader2,
  IconArrowLeft,
  IconAlertCircle,
  IconStarFilled,
} from "@tabler/icons-react";
import Link from "next/link";

interface TestimonialInitialData {
  id?: string;
  customerName: string;
  deviceType: string;
  review: string;
  rating: number;
  imageUrl?: string | null;
  isPublished: boolean;
}

export function TestimonialForm({
  initialData,
}: {
  initialData?: TestimonialInitialData;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState<number>(initialData?.rating || 5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("rating", rating.toString());

    const result = isEditing
      ? await updateTestimonialAction(initialData!.id!, formData)
      : await createTestimonialAction(formData);

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error?.message || "Gagal menyimpan testimoni.");
      return;
    }

    router.push("/admin/testimonials");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Testimoni</span>
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
              {isEditing ? "Perbarui Testimoni" : "Simpan Testimoni"}
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
        <div className="space-y-1.5">
          <Label htmlFor="customerName">Nama Pelanggan *</Label>
          <Input
            id="customerName"
            name="customerName"
            required
            defaultValue={initialData?.customerName || ""}
            placeholder="Contoh: Budi Santoso"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deviceType">Tipe Perangkat Android *</Label>
          <Input
            id="deviceType"
            name="deviceType"
            required
            defaultValue={initialData?.deviceType || ""}
            placeholder="Contoh: POCO X3 Pro / Redmi Note 10"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Rating Kepuasan (1–5 Bintang) *</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors cursor-pointer"
                title={`${star} Bintang`}
              >
                <IconStarFilled
                  className={`w-6 h-6 transition-colors ${
                    star <= rating
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--color-border)]"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-semibold text-[var(--color-primary)] ml-2">
              {rating} dari 5 bintang
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="review">Isi Ulasan / Testimoni *</Label>
          <Textarea
            id="review"
            name="review"
            required
            rows={4}
            defaultValue={initialData?.review || ""}
            placeholder="Ceritakan pengalaman servis perangkat yang berhasil diperbaiki..."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">URL Screenshot Bukti (opsional)</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="text"
            defaultValue={initialData?.imageUrl || ""}
            placeholder="/testimonials/bukti-servis.jpg"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Isi bila testimoni berupa tangkapan layar. Muncul di halaman Testimoni.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[var(--color-border)]">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            defaultChecked={initialData?.isPublished ?? false}
            className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Publikasikan testimoni ini di website
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/testimonials">
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
              {isEditing ? "Perbarui Testimoni" : "Simpan Testimoni"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
