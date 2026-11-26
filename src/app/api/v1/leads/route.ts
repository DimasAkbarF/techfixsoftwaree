import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isValidWhatsappNumber, normalizePhone } from "@/lib/phone";
import { notifyNewLead } from "@/lib/notify-lead";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const checkLeadRateLimit = createRateLimiter({
  windowMs: 10 * 60_000, // 10 menit
  max: 5,
});

const leadSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  phone: z
    .string()
    .trim()
    .refine(isValidWhatsappNumber, "Nomor WhatsApp tidak valid. Contoh: 081234567890"),
  deviceType: z
    .string()
    .trim()
    .min(1, "Jenis device wajib diisi")
    .max(120, "Tipe perangkat maksimal 120 karakter"),
  complaint: z
    .string()
    .trim()
    .min(1, "Keluhan wajib diisi")
    .max(1000, "Keluhan maksimal 1000 karakter"),
  serviceId: z.string().optional().nullable(),
  website: z.string().optional(), // honeypot anti-bot
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkLeadRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message:
            "Terlalu banyak pengajuan konsultasi dari jaringan Anda. Silakan tunggu beberapa menit sebelum mencoba lagi.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }
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

  const { name, phone, deviceType, complaint, serviceId, website } = validation.data;

  // Honeypot terisi → tolak bot tanpa menyentuh DB maupun notifikasi Telegram.
  if (website && website.trim().length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Permintaan tidak dapat diproses.",
        },
      },
      { status: 422 }
    );
  }

  const normalizedPhone = normalizePhone(phone);

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

  // 3. Cek duplikasi 60 detik terakhir (proteksi double-submit cepat), lalu simpan Lead status = NEW (NFR-05)
  let lead;
  let isDuplicate = false;
  try {
    const recent = await prisma.lead.findFirst({
      where: {
        phone: normalizedPhone,
        complaint,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      lead = recent;
      isDuplicate = true;
    } else {
      lead = await prisma.lead.create({
        data: {
          name,
          phone: normalizedPhone,
          deviceType,
          complaint,
          serviceId: serviceId || null,
          status: "NEW",
        },
      });
    }
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

  // 4. Notifikasi admin (best-effort, dilewati bila duplikat 60 detik)
  if (!isDuplicate) {
    await notifyNewLead({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      deviceType: lead.deviceType,
      complaint: lead.complaint,
      serviceName: serviceName || undefined,
    });
  }

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
