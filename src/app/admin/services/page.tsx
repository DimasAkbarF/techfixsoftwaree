import * as React from "react";
import Link from "next/link";
import { getAdminServices } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ServiceIcon } from "@/components/common/service-icon";
import { ServiceDeleteButton } from "@/components/admin/service-delete-button";
import { IconPlus, IconEdit, IconTool, IconSearch } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "ALL" } = await searchParams;
  const query = q.trim().toLowerCase();
  const statusFilter = status === "PUBLISHED" || status === "DRAFT" ? status : "ALL";

  const allServices = await getAdminServices();
  const services = allServices.filter((service) => {
    if (statusFilter === "PUBLISHED" && !service.isPublished) return false;
    if (statusFilter === "DRAFT" && service.isPublished) return false;
    if (!query) return true;
    return (
      service.name.toLowerCase().includes(query) ||
      service.slug.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
  });
  const hasFilter = Boolean(query) || statusFilter !== "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
            Katalog Layanan
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Kelola daftar layanan servis software, gejala kerusakan, instruksi persiapan, dan status publikasi.
          </p>
        </div>
        <Link href="/admin/services/new">
          <Button variant="secondary" size="sm" className="gap-2">
            <IconPlus className="w-4 h-4" />
            <span>Tambah Layanan</span>
          </Button>
        </Link>
      </div>

      {allServices.length > 0 && (
        <form method="GET" className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama, slug, atau kategori layanan..."
              aria-label="Cari layanan"
              className="h-10 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            aria-label="Filter status layanan"
            className="h-10 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="ALL">Semua Status ({allServices.length})</option>
            <option value="PUBLISHED">Terbit</option>
            <option value="DRAFT">Draft</option>
          </select>
          <Button type="submit" variant="outline" size="sm" className="h-10">
            Terapkan
          </Button>
          {hasFilter && (
            <Link
              href="/admin/services"
              className="text-xs font-semibold text-[var(--color-secondary)] hover:underline px-1"
            >
              Reset
            </Link>
          )}
        </form>
      )}

      {services.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]">
          <IconTool className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
          <h3 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
            {hasFilter ? "Tidak ada layanan yang cocok" : "Belum ada layanan"}
          </h3>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
            {hasFilter
              ? "Coba ubah kata kunci pencarian atau reset filter status."
              : "Tambahkan layanan servis pertama (seperti Bootloop, Flashing, atau Root) untuk mengisi katalog website."}
          </p>
          {hasFilter ? (
            <Link href="/admin/services">
              <Button variant="outline" size="sm">
                Reset Filter
              </Button>
            </Link>
          ) : (
            <Link href="/admin/services/new">
              <Button variant="secondary" size="sm" className="gap-2">
                <IconPlus className="w-4 h-4" />
                <span>Tambah Layanan Sekarang</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Layanan & Slug</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Label Harga</TableHead>
              <TableHead className="w-[100px] text-center">Urutan</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--color-border)] flex items-center justify-center bg-[#F9FAFB] shrink-0 mt-0.5">
                      <ServiceIcon name={service.icon} className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-primary)]">
                        {service.name}
                      </div>
                      <div className="text-xs font-mono text-[var(--color-muted)]">
                        /{service.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 bg-[#F1F4F6] rounded-[var(--radius)] text-[var(--color-secondary)]">
                    {service.category}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--color-fg)] font-mono">
                    {service.priceFromLabel}
                  </span>
                </TableCell>
                <TableCell className="text-center font-mono text-xs">
                  {service.sortOrder}
                </TableCell>
                <TableCell className="text-center">
                  {service.isPublished ? (
                    <Badge variant="success">Terbit</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
                      title="Edit Layanan"
                    >
                      <IconEdit className="w-4 h-4" />
                    </Link>
                    <ServiceDeleteButton id={service.id} name={service.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
