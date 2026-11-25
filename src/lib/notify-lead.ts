import { formatRupiah } from "@/lib/phone";

interface NewLeadNotification {
  id: string;
  name: string;
  phone: string | null;
  deviceType: string;
  complaint: string;
  serviceName?: string;
}

/**
 * Kirim notifikasi lead baru ke Telegram bila TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID diset.
 * Tidak pernah melempar error: kegagalan notifikasi tidak boleh menggagalkan penyimpanan lead (NFR-05).
 */
export async function notifyNewLead(lead: NewLeadNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    "Lead baru TechFixSoftware",
    `Nama: ${lead.name}`,
    lead.phone ? `WA: ${lead.phone}` : null,
    `Device: ${lead.deviceType}`,
    lead.serviceName ? `Layanan: ${lead.serviceName}` : "Layanan: Konsultasi umum",
    `Keluhan: ${lead.complaint}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      // Jangan tahan response form konsultasi lebih lama dari 3 detik.
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.error("Gagal mengirim notifikasi lead ke Telegram:", error);
  }
}

export function formatAgreedPrice(value: number | null) {
  return value === null ? "dihapus" : formatRupiah(value);
}
