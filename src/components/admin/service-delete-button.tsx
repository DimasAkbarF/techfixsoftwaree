"use client";

import * as React from "react";
import { deleteServiceAction } from "@/app/admin/services/actions";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";

export function ServiceDeleteButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Yakin ingin menghapus layanan "${name}"? Lead yang merujuk layanan ini tidak akan terhapus (serviceId menjadi NULL).`
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteServiceAction(id);
    if (!result.success) {
      alert("Gagal menghapus layanan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius)] hover:bg-[#FCE8E6] transition-colors cursor-pointer disabled:opacity-50"
      title="Hapus Layanan"
    >
      {loading ? (
        <IconLoader2 className="w-4 h-4 animate-spin" />
      ) : (
        <IconTrash className="w-4 h-4" />
      )}
    </button>
  );
}
