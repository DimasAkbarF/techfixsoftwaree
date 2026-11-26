import * as React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import {
  IconUsers,
  IconTool,
  IconArticle,
  IconStar,
  IconArrowRight,
} from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let newLeadsCount = 0;
  let activeServicesCount = 0;
  let articlesCount = 0;
  let testimonialsCount = 0;
  let dueLeadsCount = 0;
  let dueLeads: Array<{
    id: string;
    name: string;
    deviceType: string;
    status: string;
    nextFollowUpAt: Date | null;
  }> = [];

  const dueWhere = {
    OR: [
      { status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED] } },
      { status: LeadStatus.SCHEDULED, nextFollowUpAt: { lte: new Date() } },
    ],
  };

  try {
    const [leads, services, articles, testimonials, due, dueList] = await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.service.count({ where: { isPublished: true } }),
      prisma.article.count(),
      prisma.testimonial.count(),
      prisma.lead.count({ where: dueWhere }),
      prisma.lead.findMany({
        where: dueWhere,
        orderBy: [{ nextFollowUpAt: "asc" }, { createdAt: "asc" }],
        take: 5,
        select: {
          id: true,
          name: true,
          deviceType: true,
          status: true,
          nextFollowUpAt: true,
        },
      }),
    ]);
    newLeadsCount = leads;
    activeServicesCount = services;
    articlesCount = articles;
    testimonialsCount = testimonials;
    dueLeadsCount = due;
    dueLeads = dueList;
  } catch {
    // Database connection pending or offline
  }

  const statCards = [
    {
      title: "Lead Baru",
      value: newLeadsCount,
      desc: "Menunggu tindak lanjut",
      href: "/admin/leads",
      icon: IconUsers,
      accent: "text-[var(--color-accent)]",
    },
    {
      title: "Layanan Aktif",
      value: activeServicesCount,
      desc: "Tampil di katalog publik",
      href: "/admin/services",
      icon: IconTool,
      accent: "text-[var(--color-primary)]",
    },
    {
      title: "Total Artikel",
      value: articlesCount,
      desc: "Edukasi & panduan",
      href: "/admin/articles",
      icon: IconArticle,
      accent: "text-[var(--color-primary)]",
    },
    {
      title: "Testimoni",
      value: testimonialsCount,
      desc: "Ulasan terkurasi admin",
      href: "/admin/testimonials",
      icon: IconStar,
      accent: "text-[var(--color-primary)]",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
          Ringkasan Operasional
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Pantau status penanganan lead dan kelola katalog servis TechFixSoftware.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 rounded-[var(--radius)] hover:border-[var(--color-primary)] transition-all block group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  {card.title}
                </span>
                <Icon className={`w-5 h-5 ${card.accent}`} />
              </div>
              <div className="text-3xl font-bold font-mono text-[var(--color-primary)] mb-1">
                {card.value}
              </div>
              <div className="text-xs text-[var(--color-muted)] flex items-center justify-between">
                <span>{card.desc}</span>
                <IconArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-[var(--color-primary)]">
              Perlu ditindaklanjuti ({dueLeadsCount})
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Lead baru, yang belum dihubungi, dan jadwal follow-up yang sudah lewat.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline shrink-0"
          >
            Buka manajemen lead
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dueLeads.length === 0 ? (
          <p className="border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-muted)]">
            Tidak ada lead yang menunggu tindak lanjut.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
            {dueLeads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href="/admin/leads"
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-[var(--color-accent)]"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-[var(--color-primary)]">
                      {lead.name}
                    </span>
                    <span className="text-[var(--color-muted)]"> · {lead.deviceType}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[var(--color-muted)]">
                    {lead.nextFollowUpAt
                      ? `follow-up ${new Date(lead.nextFollowUpAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}`
                      : lead.status === "NEW"
                        ? "baru"
                        : "belum dihubungi"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 rounded-[var(--radius)]">
        <h2 className="font-heading text-base font-semibold mb-2">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--color-border)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
          >
            <IconTool className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Tambah Layanan Baru</span>
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--color-border)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
          >
            <IconArticle className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Tulis Artikel Baru</span>
          </Link>
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--color-border)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
          >
            <IconStar className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Tambah Testimoni</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--color-border)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
          >
            <IconTool className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Atur Nomor WhatsApp &amp; Harga</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
