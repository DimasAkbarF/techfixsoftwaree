"use client";

import * as React from "react";
import Link from "next/link";
import { ServiceIcon } from "@/components/common/service-icon";
import { IconArrowRight, IconFilter, IconTool } from "@tabler/icons-react";

interface CatalogService {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceFromLabel: string;
  icon: string | null;
}

const outlineLinkClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/75 px-3 text-xs font-medium text-[var(--color-fg)] hover:bg-[#fbfdfc]/90";

export function ServiceList({ services }: { services: CatalogService[] }) {
  if (services.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]/85">
        <IconTool className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
        <h2 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
          Tidak ada layanan pada kategori ini
        </h2>
        <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
          Silakan reset filter untuk melihat seluruh katalog servis software Android yang tersedia.
        </p>
        <Link href="/services" className={outlineLinkClass}>
          Reset Filter
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
      {services.map((service) => (
        <div
          key={service.id}
          className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0B1220]/[0.035] transition-colors"
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-[var(--radius)] border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)]/70 shrink-0 mt-0.5">
              <ServiceIcon name={service.icon} className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-lg font-bold text-[var(--color-primary)]">
                  {service.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-[var(--radius)] bg-[var(--color-surface)]/75 text-[var(--color-secondary)] font-medium">
                  {service.category}
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] max-w-2xl line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 pl-14 md:pl-0 shrink-0">
            <div className="text-right">
              <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider">
                Biaya Servis
              </div>
              <div className="text-sm font-semibold font-mono text-[var(--color-primary)]">
                {service.priceFromLabel}
              </div>
            </div>
            <Link href={`/services/${service.slug}`} className={outlineLinkClass}>
              <span>Detail &amp; Konsultasi</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Filter dikerjakan di klien: tidak ada request server saat ganti kategori, halaman tetap statis.
export function ServiceCatalog({ services }: { services: CatalogService[] }) {
  const [category, setCategory] = React.useState("");

  React.useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("category") || "";
    if (param) setCategory(param.trim());
  }, []);

  const categories = Array.from(new Set(services.map((service) => service.category)));
  const filtered = category ? services.filter((s) => s.category === category) : services;

  const select = (cat: string) => {
    setCategory(cat);
    window.history.replaceState(null, "", cat ? `/services?category=${encodeURIComponent(cat)}` : "/services");
  };

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-[var(--radius)] shrink-0 cursor-pointer transition-colors ${
      active
        ? "bg-[var(--color-primary)] text-white"
        : "border border-[var(--color-border)] bg-[var(--color-surface)]/75 text-[var(--color-fg)] hover:bg-[#fbfdfc]/90"
    }`;

  return (
    <>
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mr-2 shrink-0">
          <IconFilter className="w-4 h-4" />
          <span>Kategori:</span>
        </div>
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => select("")}
          className={chipClass(!category)}
        >
          Semua Layanan
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            onClick={() => select(cat)}
            className={chipClass(category === cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <ServiceList services={filtered} />
    </>
  );
}
