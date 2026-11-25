import * as React from "react";
import Link from "next/link";
import { getAdminRoms } from "./actions";
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
import { RomDeleteButton } from "@/components/admin/rom-delete-button";
import { IconPlus, IconEdit, IconBrandAndroid } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function AdminRomsPage() {
  const roms = await getAdminRoms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-primary)]">
            Logo Custom ROM
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Kelola logo ROM yang bergeser di pita beranda: unggah foto, atur urutan, sembunyikan,
            atau hapus.
          </p>
        </div>
        <Link href="/admin/roms/new">
          <Button variant="secondary" size="sm" className="gap-2">
            <IconPlus className="w-4 h-4" />
            <span>Tambah ROM</span>
          </Button>
        </Link>
      </div>

      {roms.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]">
          <IconBrandAndroid className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
          <h3 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
            Belum ada logo ROM
          </h3>
          <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-4">
            Selama daftar kosong, beranda memakai daftar cadangan yang tertanam di kode.
          </p>
          <Link href="/admin/roms/new">
            <Button variant="secondary" size="sm" className="gap-2">
              <IconPlus className="w-4 h-4" />
              <span>Tambah ROM Sekarang</span>
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">Logo & Nama</TableHead>
              <TableHead className="w-[100px] text-center">Urutan</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roms.map((rom) => (
              <TableRow key={rom.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius)] border border-[var(--color-border)] bg-[#F9FAFB] shrink-0 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rom.logoUrl}
                        alt={`Logo ${rom.name}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="font-medium text-[var(--color-primary)]">{rom.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono text-xs">{rom.sortOrder}</TableCell>
                <TableCell className="text-center">
                  {rom.isPublished ? (
                    <Badge variant="success">Tampil</Badge>
                  ) : (
                    <Badge variant="secondary">Disembunyikan</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/roms/${rom.id}/edit`}
                      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius)] hover:bg-[#F1F4F6] transition-colors"
                      title="Edit ROM"
                    >
                      <IconEdit className="w-4 h-4" />
                    </Link>
                    <RomDeleteButton id={rom.id} name={rom.name} />
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
