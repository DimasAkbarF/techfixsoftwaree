"use client";

import * as React from "react";
import { deleteRomAction } from "@/app/admin/roms/actions";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";

export function RomDeleteButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ROM "${name}" dari pita beranda?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteRomAction(id);
    if (!result.success) {
      alert("Gagal menghapus ROM. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius)] hover:bg-[#FCE8E6] transition-colors cursor-pointer disabled:opacity-50"
      title="Hapus ROM"
    >
      {loading ? (
        <IconLoader2 className="w-4 h-4 animate-spin" />
      ) : (
        <IconTrash className="w-4 h-4" />
      )}
    </button>
  );
}
