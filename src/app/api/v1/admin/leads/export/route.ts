import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const HEADERS = [
  "ID",
  "Nama",
  "WhatsApp",
  "Device",
  "Keluhan",
  "Layanan",
  "Status",
  "Harga Kesepakatan",
  "Follow-up",
  "Masuk",
  "Pertama Dihubungi",
  "Catatan Admin",
];

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toLocalString(date: Date | null) {
  return date ? date.toLocaleString("id-ID") : "";
}

export async function GET() {
  const session = await getAdminSession();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Sesi admin tidak ada atau kedaluwarsa" },
      },
      { status: 401 }
    );
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { service: { select: { name: true } } },
  });

  const rows = leads.map((lead) =>
    [
      lead.id,
      lead.name,
      lead.phone,
      lead.deviceType,
      lead.complaint,
      lead.service?.name || "Konsultasi Umum",
      lead.status,
      lead.agreedPrice,
      toLocalString(lead.nextFollowUpAt),
      toLocalString(lead.createdAt),
      toLocalString(lead.contactedAt),
      lead.adminNote,
    ]
      .map(csvCell)
      .join(",")
  );

  // BOM agar Excel membaca UTF-8 dengan benar.
  const csv = "\uFEFF" + [HEADERS.map(csvCell).join(","), ...rows].join("\r\n");
  const filename = `leads-techfixsoftware-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
