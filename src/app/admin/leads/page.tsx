import * as React from "react";
import { getAdminLeads } from "./actions";
import { LeadsManager } from "./leads-manager";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Manajemen Prospek (Leads)
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Triase prospek masuk, ubah status penanganan (`NEW`, `CONTACTED`, `SCHEDULED`, `DONE`, `CANCELLED`), dan catat hasil komunikasi WhatsApp.
        </p>
      </div>

      <LeadsManager initialLeads={leads} />
    </div>
  );
}
