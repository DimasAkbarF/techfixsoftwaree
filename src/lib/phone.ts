export function normalizePhone(input: string) {
  const digits = input.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

export function isValidWhatsappNumber(input: string) {
  return /^62\d{8,13}$/.test(normalizePhone(input));
}

export function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}
