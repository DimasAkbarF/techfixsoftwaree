import * as React from "react";
import { notFound } from "next/navigation";
import { getAdminTestimonialById } from "@/app/admin/testimonials/actions";
import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await getAdminTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Edit Testimoni: {testimonial.customerName}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Perbarui teks ulasan, rating kepuasan, atau status publikasi testimoni.
        </p>
      </div>

      <TestimonialForm initialData={testimonial} />
    </div>
  );
}
