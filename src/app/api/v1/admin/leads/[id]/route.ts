import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { z } from "zod";
import { LeadStatus, Prisma } from "@prisma/client";
import { formatRupiah } from "@/lib/phone";

export const dynamic = "force-dynamic";

const patchLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  adminNote: z.string().optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  agreedPrice: z.number().int().nonnegative().optional().nullable(),
});

const leadInclude = {
  service: { select: { id: true, name: true, slug: true } },
  activities: { orderBy: { createdAt: "desc" } },
} satisfies Prisma.LeadInclude;

function formatFollowUp(date: Date) {
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Sesi admin tidak ada atau kedaluwarsa",
        },
      },
      { status: 401 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Format request body tidak valid JSON",
        },
      },
      { status: 422 }
    );
  }

  const validation = patchLeadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message || "Input tidak valid",
        },
      },
      { status: 422 }
    );
  }

  if (
    validation.data.status === undefined &&
    validation.data.adminNote === undefined &&
    validation.data.nextFollowUpAt === undefined &&
    validation.data.agreedPrice === undefined
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Minimal satu field harus dikirim",
        },
      },
      { status: 422 }
    );
  }

  const existingLead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!existingLead) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Data lead tidak ditemukan",
        },
      },
      { status: 404 }
    );
  }

  const updateData: {
    status?: LeadStatus;
    adminNote?: string | null;
    nextFollowUpAt?: Date | null;
    agreedPrice?: number | null;
    contactedAt?: Date;
  } = {};
  const activities: Prisma.LeadActivityCreateManyInput[] = [];

  if (validation.data.status !== undefined) {
    updateData.status = validation.data.status;

    // Critical requirement (DATABASE.md §3.2, FEATURES.md F-08, TASKS.md TASK-09):
    // "contactedAt diisi saat status pertama kali menjadi CONTACTED dan tidak ditimpa pada perubahan berikutnya"
    if (validation.data.status === "CONTACTED" && !existingLead.contactedAt) {
      updateData.contactedAt = new Date();
    }

    if (validation.data.status !== existingLead.status) {
      activities.push({
        leadId: id,
        kind: "STATUS",
        message: `Status: ${existingLead.status} → ${validation.data.status}`,
      });
    }
  }

  if (validation.data.adminNote !== undefined) {
    updateData.adminNote = validation.data.adminNote;
    if (validation.data.adminNote) {
      activities.push({
        leadId: id,
        kind: "NOTE",
        message: validation.data.adminNote,
      });
    }
  }

  if (validation.data.nextFollowUpAt !== undefined) {
    const next = validation.data.nextFollowUpAt
      ? new Date(validation.data.nextFollowUpAt)
      : null;
    updateData.nextFollowUpAt = next;
    activities.push({
      leadId: id,
      kind: "FOLLOW_UP",
      message: next ? `Follow-up dijadwalkan ${formatFollowUp(next)}` : "Jadwal follow-up dihapus",
    });
  }

  if (validation.data.agreedPrice !== undefined) {
    updateData.agreedPrice = validation.data.agreedPrice;
    activities.push({
      leadId: id,
      kind: "PRICE",
      message:
        validation.data.agreedPrice === null
          ? "Harga kesepakatan dihapus"
          : `Harga kesepakatan: ${formatRupiah(validation.data.agreedPrice)}`,
    });
  }

  try {
    await prisma.$transaction([
      prisma.lead.update({ where: { id }, data: updateData }),
      ...(activities.length > 0
        ? [prisma.leadActivity.createMany({ data: activities })]
        : []),
    ]);

    const updated = await prisma.lead.findUnique({
      where: { id },
      include: leadInclude,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memperbarui lead",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Sesi admin tidak ada atau kedaluwarsa",
        },
      },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Data lead tidak ditemukan" },
      },
      { status: 404 }
    );
  }
}
