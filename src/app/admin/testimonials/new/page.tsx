import * as React from "react";
import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Tambah Testimoni Baru
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Input ulasan pelanggan secara manual (DEC-005). Hanya testimoni terbit yang tampil di website.
        </p>
      </div>

      <TestimonialForm />
    </div>
  );
}
