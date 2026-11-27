/**
 * Memastikan URL media hanya berupa path relatif lokal ("/...") atau URL HTTPS valid.
 * Menolak skema berbahaya seperti javascript:, data:, vbscript:, http:, dan protocol-relative "//".
 */
export function isSafeMediaUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !/[\r\n\0]/.test(trimmed);
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
