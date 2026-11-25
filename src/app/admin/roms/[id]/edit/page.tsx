import * as React from "react";
import { notFound } from "next/navigation";
import { getAdminRomById } from "@/app/admin/roms/actions";
import { RomForm } from "@/app/admin/roms/rom-form";

export const dynamic = "force-dynamic";

export default async function EditRomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rom = await getAdminRomById(id);

  if (!rom) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Edit ROM: {rom.name}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Ganti logo, ubah nama, atau atur status tampil di beranda.
        </p>
      </div>

      <RomForm initialData={rom} />
    </div>
  );
}
