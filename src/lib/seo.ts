import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export { SITE_NAME };

/** Potong teks di batas kata; dipakai untuk meta description dari data DB. */
export function clip(text: string, max = 158) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.lastIndexOf(" ", max);
  return `${flat.slice(0, cut > 0 ? cut : max).trim()}…`;
}

/**
 * Paragraf pembuka dari deskripsi layanan panjang (heading + bullet + Q&A).
 * Kartu katalog, meta description, dan schema memakai bagian ini agar tidak
 * ikut menelan heading atau bullet.
 */
export function leadParagraph(text: string) {
  const first = text.split(/\n\s*\n/)[0] ?? text;
  return first
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-•*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Metadata per halaman. Next tidak mewarisi title/description ke Open Graph,
 * jadi keduanya harus diisi eksplisit di setiap halaman.
 */
export function pageSeo({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** BreadcrumbList JSON-LD; minimal dua item (Beranda + halaman). */
export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
