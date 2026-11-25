"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { LeadStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatRupiah } from "@/lib/phone";

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

export async function getAdminLeads(status?: string) {
  await requireAdminSession();

  try {
    const whereClause: { status?: LeadStatus } = {};
    if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      whereClause.status = status as LeadStatus;
    }

    return await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: leadInclude,
    });
  } catch (error) {
    console.error("Error in getAdminLeads:", error);
    return [];
  }
}

export async function updateLeadStatusAndNote(
  id: string,
  newStatus?: LeadStatus,
  adminNote?: string | null,
  extras?: { nextFollowUpAt?: string | null; agreedPrice?: number | null }
) {
  await requireAdminSession();

  if (
    newStatus === undefined &&
    adminNote === undefined &&
    extras?.nextFollowUpAt === undefined &&
    extras?.agreedPrice === undefined
  ) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Tidak ada perubahan yang dikirim" },
    };
  }

  const existingLead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!existingLead) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Data lead tidak ditemukan" },
    };
  }

  const updateData: {
    status?: LeadStatus;
    adminNote?: string | null;
    nextFollowUpAt?: Date | null;
    agreedPrice?: number | null;
    contactedAt?: Date;
  } = {};
  const activities: Prisma.LeadActivityCreateManyInput[] = [];

  if (newStatus && newStatus !== existingLead.status) {
    updateData.status = newStatus;

    // contactedAt hanya diisi saat transisi PERTAMA ke CONTACTED (TASK-09)
    if (newStatus === "CONTACTED" && !existingLead.contactedAt) {
      updateData.contactedAt = new Date();
    }

    activities.push({
      leadId: id,
      kind: "STATUS",
      message: `Status: ${existingLead.status} → ${newStatus}`,
    });
  }

  if (adminNote !== undefined) {
    updateData.adminNote = adminNote;
    if (adminNote) {
      activities.push({ leadId: id, kind: "NOTE", message: adminNote });
    }
  }

  if (extras?.nextFollowUpAt !== undefined) {
    const next = extras.nextFollowUpAt ? new Date(extras.nextFollowUpAt) : null;
    updateData.nextFollowUpAt = next;
    activities.push({
      leadId: id,
      kind: "FOLLOW_UP",
      message: next ? `Follow-up dijadwalkan ${formatFollowUp(next)}` : "Jadwal follow-up dihapus",
    });
  }

  if (extras?.agreedPrice !== undefined) {
    updateData.agreedPrice = extras.agreedPrice;
    activities.push({
      leadId: id,
      kind: "PRICE",
      message:
        extras.agreedPrice === null
          ? "Harga kesepakatan dihapus"
          : `Harga kesepakatan: ${formatRupiah(extras.agreedPrice)}`,
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

    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("Error updating lead status:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal memperbarui lead" },
    };
  }
}

export async function deleteLead(id: string) {
  await requireAdminSession();

  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Gagal menghapus lead" },
    };
  }
}
