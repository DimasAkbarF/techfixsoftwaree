import * as React from "react";
import { getSiteSetting } from "./actions";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const setting = await getSiteSetting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Pengaturan Situs
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Kelola nomor WhatsApp konsultasi, identitas brand, dan label harga minimum (Singleton).
        </p>
      </div>

      <SettingsForm initialData={setting} />
    </div>
  );
}
