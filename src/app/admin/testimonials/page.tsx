import * as React from "react";
import Link from "next/link";
import { getAdminTestimonials } from "./actions";
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
import { TestimonialDeleteButton } from "@/components/admin/testimonial-delete-button";
import { IconPlus, IconEdit, IconStar, IconStarFilled } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
            Manajemen Testimoni Pelanggan
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Input dan kurasi ulasan pelanggan servis (DEC-005: Hanya diinput manual oleh admin, tanpa form publik).
          </p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button variant="secondary" size="sm" className="gap-2">
            <IconPlus className="w-4 h-4" />
            <span>Tambah Testimoni</span>
          </Button>
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]">
          <IconStar className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
          <h3 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
            Belum ada testimoni
          </h3>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
            Tambahkan testimoni manual dari feedback pelanggan yang telah selesai diservis di WhatsApp.
          </p>
          <Link href="/admin/testimonials/new">
            <Button variant="secondary" size="sm" className="gap-2">
              <IconPlus className="w-4 h-4" />
              <span>Input Testimoni Baru</span>
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Pelanggan & Device</TableHead>
              <TableHead>Isi Ulasan</TableHead>
              <TableHead className="w-[120px] text-center">Rating</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testi) => (
              <TableRow key={testi.id}>
                <TableCell>
                  <div className="font-medium text-[var(--color-primary)]">
                    {testi.customerName}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {testi.deviceType}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[var(--color-fg)] line-clamp-2 leading-relaxed">
                    &ldquo;{testi.review}&rdquo;
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1 font-semibold text-xs text-[var(--color-warning)]">
                    <IconStarFilled className="w-4 h-4" />
                    <span>{testi.rating}/5</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {testi.isPublished ? (
                    <Badge variant="success">Terbit</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/testimonials/${testi.id}/edit`}
                      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
                      title="Edit Testimoni"
                    >
                      <IconEdit className="w-4 h-4" />
                    </Link>
                    <TestimonialDeleteButton id={testi.id} customerName={testi.customerName} />
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
