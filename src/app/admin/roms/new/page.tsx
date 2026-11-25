import * as React from "react";
import { RomForm } from "@/app/admin/roms/rom-form";

export default function NewRomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Tambah Logo ROM
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Unggah logo Custom ROM baru dan tentukan urutannya di pita beranda.
        </p>
      </div>

      <RomForm />
    </div>
  );
}
