import * as React from "react";
import { notFound } from "next/navigation";
import { getAdminServiceById } from "@/app/admin/services/actions";
import { ServiceForm } from "@/app/admin/services/service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getAdminServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Edit Layanan: {service.name}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Perbarui deskripsi, persiapan pelanggan, atau status publikasi layanan.
        </p>
      </div>

      <ServiceForm initialData={service} />
    </div>
  );
}
