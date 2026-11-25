import * as React from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconTool,
  IconBrandAndroid,
  IconUsers,
  IconArticle,
  IconStar,
  IconSettings,
  IconExternalLink,
} from "@tabler/icons-react";
import { AdminNavLogout } from "@/components/admin/admin-nav-logout";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: IconDashboard },
    { label: "Layanan", href: "/admin/services", icon: IconTool },
    { label: "Custom ROM", href: "/admin/roms", icon: IconBrandAndroid },
    { label: "Leads", href: "/admin/leads", icon: IconUsers },
    { label: "Artikel", href: "/admin/articles", icon: IconArticle },
    { label: "Testimoni", href: "/admin/testimonials", icon: IconStar },
    { label: "Pengaturan Situs", href: "/admin/settings", icon: IconSettings },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <Link href="/admin" aria-label="TechFixSoftware CMS" className="flex items-center gap-2">
            <BrandLogo className="h-8" />
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
              CMS
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] flex items-center gap-1"
            title="Lihat Website Publik"
          >
            <span>Web</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-[var(--radius)] text-[var(--color-fg)] hover:bg-[#F1F4F6] transition-colors"
              >
                <Icon className="w-4 h-4 text-[var(--color-muted)]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--color-border)]">
          <AdminNavLogout />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
