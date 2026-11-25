import * as React from "react";
import { ServiceForm } from "@/app/admin/services/service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Tambah Layanan Baru
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Definisikan layanan servis baru, gejala kerusakan, instruksi persiapan, dan label harga minimum.
        </p>
      </div>

      <ServiceForm />
    </div>
  );
}
