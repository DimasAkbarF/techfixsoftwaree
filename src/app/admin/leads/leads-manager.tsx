"use client";

import * as React from "react";
import Link from "next/link";
import {
  updateLeadStatusAndNote,
  deleteLead,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  IconUsers,
  IconCheck,
  IconDeviceMobile,
  IconLoader2,
  IconNotes,
  IconSearch,
  IconBrandWhatsapp,
  IconDownload,
  IconTrash,
  IconHistory,
} from "@tabler/icons-react";
import { LeadStatus } from "@prisma/client";
import { formatRupiah } from "@/lib/phone";

interface LeadActivityItem {
  id: string;
  kind: string;
  message: string;
  createdAt: Date | string;
}

interface LeadItem {
  id: string;
  name: string;
  phone: string | null;
  deviceType: string;
  complaint: string;
  serviceId: string | null;
  status: LeadStatus;
  adminNote: string | null;
  agreedPrice: number | null;
  nextFollowUpAt: Date | string | null;
  contactedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  service?: { id: string; name: string; slug: string } | null;
  activities?: LeadActivityItem[];
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "secondary" }
> = {
  NEW: { label: "BARU (NEW)", variant: "danger" },
  CONTACTED: { label: "DIHUBUNGI", variant: "warning" },
  SCHEDULED: { label: "PERJANJIAN", variant: "secondary" },
  DONE: { label: "SELESAI", variant: "success" },
  CANCELLED: { label: "BATAL", variant: "default" },
};

const ACTIVITY_LABEL: Record<string, string> = {
  STATUS: "Status",
  NOTE: "Catatan",
  FOLLOW_UP: "Jadwal",
  PRICE: "Harga",
};

function toLocalInput(value: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function whatsappLink(lead: LeadItem) {
  if (!lead.phone) return null;
  const text = `Halo ${lead.name}, saya dari TechFixSoftware. Menindaklanjuti konsultasi servis ${lead.deviceType} yang Anda kirim.`;
  return `https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`;
}

export function LeadsManager({ initialLeads }: { initialLeads: LeadItem[] }) {
  const [leads, setLeads] = React.useState<LeadItem[]>(initialLeads);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [selectedLead, setSelectedLead] = React.useState<LeadItem | null>(
    initialLeads[0] || null
  );
  const [updating, setUpdating] = React.useState(false);
  const [noteText, setNoteText] = React.useState(selectedLead?.adminNote || "");
  const [followUpInput, setFollowUpInput] = React.useState(
    toLocalInput(selectedLead?.nextFollowUpAt ?? null)
  );
  const [agreedPriceInput, setAgreedPriceInput] = React.useState(
    selectedLead?.agreedPrice ? String(selectedLead.agreedPrice) : ""
  );
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNoteText(selectedLead?.adminNote || "");
    setFollowUpInput(toLocalInput(selectedLead?.nextFollowUpAt ?? null));
    setAgreedPriceInput(
      selectedLead?.agreedPrice ? String(selectedLead.agreedPrice) : ""
    );
    setFeedbackMsg(null);
  }, [selectedLead]);

  const filteredLeads = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
      const matchQuery =
        query.length === 0 ||
        lead.name.toLowerCase().includes(query) ||
        lead.deviceType.toLowerCase().includes(query) ||
        (lead.phone || "").includes(query);
      return matchStatus && matchQuery;
    });
  }, [leads, selectedStatus, search]);

  const applyUpdated = (updated: LeadItem) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    setUpdating(true);
    setFeedbackMsg(null);

    const res = await updateLeadStatusAndNote(selectedLead.id, newStatus);
    setUpdating(false);

    if (res.success && res.data) {
      applyUpdated(res.data as LeadItem);
      setFeedbackMsg(`Status diubah ke ${STATUS_CONFIG[newStatus].label}`);
    } else {
      setFeedbackMsg(res.error?.message || "Gagal mengubah status.");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    setFeedbackMsg(null);

    const res = await updateLeadStatusAndNote(
      selectedLead.id,
      undefined,
      noteText.trim().length > 0 ? noteText.trim() : null
    );
    setUpdating(false);

    if (res.success && res.data) {
      applyUpdated(res.data as LeadItem);
      setFeedbackMsg("Catatan internal berhasil disimpan.");
    } else {
      setFeedbackMsg(res.error?.message || "Gagal menyimpan catatan.");
    }
  };

  const handleSaveOps = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    setFeedbackMsg(null);

    const priceValue = agreedPriceInput.trim();
    const res = await updateLeadStatusAndNote(selectedLead.id, undefined, undefined, {
      nextFollowUpAt: followUpInput ? new Date(followUpInput).toISOString() : null,
      agreedPrice: priceValue ? Number(priceValue) : null,
    });
    setUpdating(false);

    if (res.success && res.data) {
      applyUpdated(res.data as LeadItem);
      setFeedbackMsg("Jadwal follow-up dan harga tersimpan.");
    } else {
      setFeedbackMsg(res.error?.message || "Gagal menyimpan jadwal/harga.");
    }
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    if (
      !window.confirm(
        `Hapus permanen lead "${selectedLead.name}"? Data pelanggan dan riwayatnya ikut terhapus.`
      )
    ) {
      return;
    }

    setUpdating(true);
    const res = await deleteLead(selectedLead.id);
    setUpdating(false);

    if (res.success) {
      const remaining = leads.filter((l) => l.id !== selectedLead.id);
      setLeads(remaining);
      setSelectedLead(remaining[0] || null);
      setFeedbackMsg("Lead dihapus.");
    } else {
      setFeedbackMsg(res.error?.message || "Gagal menghapus lead.");
    }
  };

  const statusTabs: Array<{ id: string; label: string }> = [
    { id: "ALL", label: `Semua (${leads.length})` },
    { id: "NEW", label: `Baru (${leads.filter((l) => l.status === "NEW").length})` },
    { id: "CONTACTED", label: `Dihubungi (${leads.filter((l) => l.status === "CONTACTED").length})` },
    { id: "SCHEDULED", label: `Perjanjian (${leads.filter((l) => l.status === "SCHEDULED").length})` },
    { id: "DONE", label: `Selesai (${leads.filter((l) => l.status === "DONE").length})` },
    { id: "CANCELLED", label: `Batal (${leads.filter((l) => l.status === "CANCELLED").length})` },
  ];

  const waLink = selectedLead ? whatsappLink(selectedLead) : null;
  const isOverdue =
    selectedLead?.nextFollowUpAt &&
    new Date(selectedLead.nextFollowUpAt).getTime() < Date.now() &&
    selectedLead.status !== "DONE" &&
    selectedLead.status !== "CANCELLED";

  return (
    <div className="space-y-6">
      {/* Toolbar: filter status + pencarian + ekspor */}
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {statusTabs.map((tab) => {
            const active = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius)] transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] hover:bg-[#F1F4F6]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64">
            <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nomor, device"
              className="h-9 pl-8 text-xs"
            />
          </div>
          {/* Unduhan file harus melewati router klien, jadi anchor biasa. */}
          <a
            href="/api/v1/admin/leads/export"
            download
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-fg)] hover:bg-[#F1F4F6]"
          >
            <IconDownload className="h-4 w-4" />
            Ekspor CSV
          </a>
        </div>
      </div>

      {/* Master / Detail Split (DESIGN.md §6: Master/detail lead) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Master List (Col 7/12) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-12 text-center bg-[var(--color-surface)]">
              <IconUsers className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
              <h3 className="font-heading text-base font-semibold text-[var(--color-primary)] mb-1">
                {leads.length === 0 ? "Belum ada data lead" : "Tidak ada lead yang cocok"}
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                {leads.length === 0
                  ? "Lead yang masuk dari form konsultasi website akan tampil di sini."
                  : "Ubah kata kunci pencarian atau filter status."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan & Device</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  const cfg = STATUS_CONFIG[lead.status] || {
                    label: lead.status,
                    variant: "default",
                  };
                  const overdue =
                    lead.nextFollowUpAt &&
                    new Date(lead.nextFollowUpAt).getTime() < Date.now() &&
                    lead.status !== "DONE" &&
                    lead.status !== "CANCELLED";
                  return (
                    <TableRow
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer ${
                        isSelected ? "bg-[#F1F4F6] border-l-4 border-l-[var(--color-accent)]" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="font-medium text-[var(--color-primary)]">
                          {lead.name}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                          <IconDeviceMobile className="w-3.5 h-3.5" />
                          <span>{lead.deviceType}</span>
                        </div>
                        {lead.phone && (
                          <div className="text-xs font-mono text-[var(--color-muted)]">
                            {lead.phone}
                          </div>
                        )}
                        {overdue && (
                          <span className="mt-1 inline-block text-[10px] font-semibold text-[var(--color-danger)]">
                            Follow-up terlambat
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--color-secondary)]">
                          {lead.service?.name || "Konsultasi Umum"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[var(--color-muted)]" suppressHydrationWarning>
                        {new Date(lead.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Detail Panel (Col 5/12) */}
        <div className="lg:col-span-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-[var(--radius)] p-6 space-y-5 lg:sticky lg:top-8">
          {selectedLead ? (
            <>
              <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-[var(--color-muted)]">
                    Detail Lead
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[var(--color-primary)] mt-1">
                    {selectedLead.name}
                  </h3>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    ID: <span className="font-mono">{selectedLead.id}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    STATUS_CONFIG[selectedLead.status]?.variant || "default"
                  }
                >
                  {STATUS_CONFIG[selectedLead.status]?.label}
                </Badge>
              </div>

              {feedbackMsg && (
                <Alert
                  variant={feedbackMsg.includes("Gagal") ? "danger" : "success"}
                >
                  <span>{feedbackMsg}</span>
                </Alert>
              )}

              {/* Data Perangkat & Keluhan */}
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[var(--color-muted)] font-medium">
                    Nomor WhatsApp:
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[var(--color-fg)]">
                      {selectedLead.phone || "Tidak tercatat"}
                    </span>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius)] bg-[var(--color-success)] px-2.5 text-xs font-medium text-white hover:brightness-110"
                      >
                        <IconBrandWhatsapp className="h-4 w-4" />
                        Chat
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[var(--color-muted)] font-medium">
                    Tipe Perangkat Android:
                  </span>
                  <div className="font-semibold text-[var(--color-fg)]">
                    {selectedLead.deviceType}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[var(--color-muted)] font-medium">
                    Layanan Terkait:
                  </span>
                  <div className="text-[var(--color-fg)]">
                    {selectedLead.service?.name || "Konsultasi Umum"}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[var(--color-muted)] font-medium">
                    Keluhan Pelanggan:
                  </span>
                  <div className="p-3 bg-[#F9FAFB] rounded-[var(--radius)] border border-[var(--color-border)] text-xs text-[var(--color-fg)] leading-relaxed mt-1">
                    {selectedLead.complaint}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--color-border)]">
                  <div>
                    <span className="text-[var(--color-muted)]">Masuk:</span>
                    <div className="font-mono text-[var(--color-fg)] mt-0.5" suppressHydrationWarning>
                      {new Date(selectedLead.createdAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Pertama Dihubungi:</span>
                    <div className="font-mono text-[var(--color-fg)] mt-0.5" suppressHydrationWarning>
                      {selectedLead.contactedAt
                        ? new Date(selectedLead.contactedAt).toLocaleString("id-ID")
                        : "Belum pernah"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Status Dropdown */}
              <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                <Label htmlFor="status-select">Ubah Status Lead</Label>
                <div className="flex gap-2">
                  <select
                    id="status-select"
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    disabled={updating}
                    className="flex h-10 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-[var(--color-muted)]">
                  Saat status diubah ke DIHUBUNGI untuk pertama kali, waktu `contactedAt` otomatis tercatat.
                </p>
              </div>

              {/* Jadwal follow-up & harga kesepakatan */}
              <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                <div className="space-y-1.5">
                  <Label htmlFor="follow-up-at">Jadwal Follow-up</Label>
                  <Input
                    id="follow-up-at"
                    type="datetime-local"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    disabled={updating}
                    className="text-xs"
                  />
                  {isOverdue && (
                    <p className="text-[11px] font-semibold text-[var(--color-danger)]">
                      Follow-up sudah lewat jadwal.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agreed-price">Harga Kesepakatan (internal)</Label>
                  <Input
                    id="agreed-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    placeholder="Contoh: 150000"
                    value={agreedPriceInput}
                    onChange={(e) => setAgreedPriceInput(e.target.value)}
                    disabled={updating}
                    className="text-xs"
                  />
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Tidak pernah tampil di halaman publik. Kosongkan untuk menghapus.
                    {selectedLead.agreedPrice
                      ? ` Tersimpan: ${formatRupiah(selectedLead.agreedPrice)}.`
                      : ""}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveOps}
                  disabled={updating}
                  className="w-full gap-2"
                >
                  {updating ? (
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IconCheck className="w-4 h-4" />
                  )}
                  Simpan Jadwal & Harga
                </Button>
              </div>

              {/* Catatan Internal Admin (DEC-004) */}
              <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-note" className="flex items-center gap-1.5">
                    <IconNotes className="w-4 h-4 text-[var(--color-muted)]" />
                    <span>Catatan Internal Admin</span>
                  </Label>
                </div>
                <Textarea
                  id="admin-note"
                  rows={3}
                  placeholder="Tulis catatan kesepakatan harga, jadwal penyerahan device, dll..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  disabled={updating}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNote}
                  disabled={updating}
                  className="w-full gap-2"
                >
                  {updating ? (
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IconCheck className="w-4 h-4" />
                  )}
                  Simpan Catatan
                </Button>
              </div>

              {/* Riwayat aktivitas */}
              <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  <IconHistory className="w-4 h-4 text-[var(--color-muted)]" />
                  Riwayat Aktivitas
                </div>
                {selectedLead.activities && selectedLead.activities.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedLead.activities.map((activity) => (
                      <li key={activity.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--color-secondary)]">
                            {ACTIVITY_LABEL[activity.kind] || activity.kind}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-muted)]">
                            {new Date(activity.createdAt).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <p className="text-[var(--color-fg)] whitespace-pre-wrap">
                          {activity.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">
                    Belum ada aktivitas tercatat.
                  </p>
                )}
              </div>

              {/* Hapus lead (data pribadi) */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={updating}
                  className="w-full gap-2"
                >
                  <IconTrash className="w-4 h-4" />
                  Hapus Lead
                </Button>
                <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">
                  Menghapus permanen data pelanggan ini beserta riwayatnya.
                </p>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-xs text-[var(--color-muted)]">
              Pilih satu lead dari daftar untuk melihat detail.
              <div className="mt-3">
                <Link href="/admin" className="text-[var(--color-accent)] hover:underline">
                  Kembali ke ringkasan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
