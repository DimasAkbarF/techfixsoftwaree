import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isValidWhatsappNumber, normalizePhone } from "@/lib/phone";
import { notifyNewLead } from "@/lib/notify-lead";

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  phone: z
    .string()
    .trim()
    .refine(isValidWhatsappNumber, "Nomor WhatsApp tidak valid. Contoh: 081234567890"),
  deviceType: z.string().trim().min(1, "Jenis device wajib diisi"),
  complaint: z.string().trim().min(1, "Keluhan wajib diisi"),
  serviceId: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
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

  const validation = leadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Input tidak valid",
          details: validation.error.issues.map((issue) => ({
            field: issue.path.join(".") || "body",
            message: issue.message,
          })),
        },
      },
      { status: 422 }
    );
  }

  const { name, phone, deviceType, complaint, serviceId } = validation.data;

  // 1. Check SiteSetting for whatsappNumber BEFORE saving lead!
  let siteSetting;
  try {
    siteSetting = await prisma.siteSetting.findUnique({
      where: { id: "singleton" },
    });
  } catch (err) {
    console.error("Database error fetching site settings:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi gangguan pada database.",
        },
      },
      { status: 500 }
    );
  }

  if (!siteSetting?.whatsappNumber || siteSetting.whatsappNumber.trim().length === 0) {
    // 503 WHATSAPP_NOT_CONFIGURED and DO NOT create lead!
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WHATSAPP_NOT_CONFIGURED",
          message: "Nomor WhatsApp admin belum dikonfigurasi. Konsultasi belum dapat dilakukan.",
        },
      },
      { status: 503 }
    );
  }

  // 2. If serviceId provided, verify it exists (optional)
  let serviceName = "";
  if (serviceId) {
    try {
      const s = await prisma.service.findUnique({ where: { id: serviceId } });
      if (s) {
        serviceName = s.name;
      }
    } catch {
      // ignore
    }
  }

  // 3. Save Lead with status = NEW BEFORE redirect! (NFR-05)
  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        name,
        phone: normalizePhone(phone),
        deviceType,
        complaint,
        serviceId: serviceId || null,
        status: "NEW",
      },
    });
  } catch (error) {
    console.error("Failed to save lead in database:", error);
    // CRITICAL: If insert fails, DO NOT redirect!
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal menyimpan data konsultasi. Silakan coba kembali.",
        },
      },
      { status: 500 }
    );
  }

  // 4. Notifikasi admin (best-effort, tidak menggagalkan lead bila gagal)
  await notifyNewLead({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    deviceType: lead.deviceType,
    complaint: lead.complaint,
    serviceName: serviceName || undefined,
  });

  // 5. Construct WhatsApp redirect URL
  let cleanNumber = siteSetting.whatsappNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  }

  const serviceContext = serviceName ? ` (${serviceName})` : "";
  const messageText = `Halo TechFixSoftware, saya ${name} ingin konsultasi servis ${deviceType}${serviceContext}.\n\nKendala:\n${complaint}`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

  return NextResponse.json(
    {
      success: true,
      data: {
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          deviceType: lead.deviceType,
          complaint: lead.complaint,
          serviceId: lead.serviceId,
          status: lead.status,
          createdAt: lead.createdAt.toISOString(),
        },
        whatsappUrl,
      },
    },
    { status: 201 }
  );
}
