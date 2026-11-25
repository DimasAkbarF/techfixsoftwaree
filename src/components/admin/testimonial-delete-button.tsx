"use client";

import * as React from "react";
import { deleteTestimonialAction } from "@/app/admin/testimonials/actions";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";

export function TestimonialDeleteButton({ id, customerName }: { id: string; customerName: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus testimoni dari "${customerName}"?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteTestimonialAction(id);
    if (!result.success) {
      alert("Gagal menghapus testimoni. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius)] hover:bg-[#FCE8E6] transition-colors cursor-pointer disabled:opacity-50"
      title="Hapus Testimoni"
    >
      {loading ? (
        <IconLoader2 className="w-4 h-4 animate-spin" />
      ) : (
        <IconTrash className="w-4 h-4" />
      )}
    </button>
  );
}
