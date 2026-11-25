"use client";

import * as React from "react";
import { deleteArticleAction } from "@/app/admin/articles/actions";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";

export function ArticleDeleteButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteArticleAction(id);
    if (!result.success) {
      alert("Gagal menghapus artikel. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-danger)] rounded-[var(--radius)] hover:bg-[#FCE8E6] transition-colors cursor-pointer disabled:opacity-50"
      title="Hapus Artikel"
    >
      {loading ? (
        <IconLoader2 className="w-4 h-4 animate-spin" />
      ) : (
        <IconTrash className="w-4 h-4" />
      )}
    </button>
  );
}
