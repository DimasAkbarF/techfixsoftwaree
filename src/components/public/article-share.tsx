"use client";

import * as React from "react";
import { IconBrandWhatsapp, IconCheck, IconLink } from "@tabler/icons-react";

export function ArticleShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Abaikan jika clipboard diblokir browser.
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--color-border)] py-4">
      <span className="text-xs font-medium text-[var(--color-muted)]">
        Panduan ini bermanfaat? Bagikan ke teman atau simpan tautannya:
      </span>
      <div className="flex items-center gap-2">
        <a
          href={waShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius)] bg-[#15803D] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#166534]"
        >
          <IconBrandWhatsapp className="h-4 w-4" />
          <span>Bagikan WA</span>
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[#F1F4F6]"
        >
          {copied ? (
            <>
              <IconCheck className="h-3.5 w-3.5 text-[#15803D]" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <IconLink className="h-3.5 w-3.5" />
              <span>Salin Tautan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
