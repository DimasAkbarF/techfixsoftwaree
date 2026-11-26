"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconTool,
  IconBrandAndroid,
  IconUsers,
  IconArticle,
  IconStar,
  IconSettings,
  IconExternalLink,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { AdminNavLogout } from "@/components/admin/admin-nav-logout";
import { BrandLogo } from "@/components/brand-logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: IconDashboard },
  { label: "Layanan", href: "/admin/services", icon: IconTool },
  { label: "Custom ROM", href: "/admin/roms", icon: IconBrandAndroid },
  { label: "Leads", href: "/admin/leads", icon: IconUsers },
  { label: "Artikel", href: "/admin/articles", icon: IconArticle },
  { label: "Testimoni", href: "/admin/testimonials", icon: IconStar },
  { label: "Pengaturan Situs", href: "/admin/settings", icon: IconSettings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between gap-2">
        <Link
          href="/admin"
          aria-label="TechFixSoftware CMS"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2"
        >
          <BrandLogo className="h-8" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            CMS
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center gap-1"
            title="Lihat Website Publik"
          >
            <span>Web</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="admin-nav-list"
            aria-label={mobileOpen ? "Tutup menu admin" : "Buka menu admin"}
            className="md:hidden inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[#F1F4F6]"
          >
            {mobileOpen ? <IconX className="w-4 h-4" /> : <IconMenu2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div
        id="admin-nav-list"
        className={`${mobileOpen ? "flex" : "hidden"} md:flex flex-col flex-1`}
      >
        <nav aria-label="Navigasi admin" className="p-3 space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-[var(--radius)] transition-colors",
                  active
                    ? "border-l-2 border-[var(--color-accent)] bg-[#eaf2ef] font-semibold text-[var(--color-primary)]"
                    : "font-medium text-[var(--color-fg)] hover:bg-[#F1F4F6]",
                ].join(" ")}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--color-border)]">
          <AdminNavLogout />
        </div>
      </div>
    </aside>
  );
}
