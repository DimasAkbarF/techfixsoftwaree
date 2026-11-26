export const SITE_NAME = "TechFixSoftware";

const configured = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Domain kanonik situs. Di produksi isi NEXT_PUBLIC_SITE_URL; default memakai
 * domain resmi https://techfixsoftware.web.id agar canonical, sitemap, robots,
 * llms.txt, dan JSON-LD tidak pernah jatuh ke localhost.
 */
export const SITE_URL = (configured ?? "https://techfixsoftware.web.id").replace(/\/$/, "");

/** Penulis/peninjau teknis; sumber: repo lama src/data/author.ts + byline situs lama. */
export const SITE_AUTHOR = {
  name: "Dimas Akbar",
  role: "Spesialis Android",
  bio: "Teknisi software Android TechFix Software: bootloop, unbrick (EDL/BROM), flash firmware, root Magisk/KernelSU, dan custom ROM.",
};
