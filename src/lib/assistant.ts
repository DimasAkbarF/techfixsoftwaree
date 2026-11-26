import { normalizePhone } from "./phone";
import { SERVICE_STEPS } from "./service-flow";

export interface AssistantLink {
  label: string;
  href: string;
}

export interface AssistantReply {
  messages: string[];
  links?: AssistantLink[];
  whatsappUrl?: string;
  whatsappLabel?: string;
  suggestions?: string[];
}

export interface AssistantService {
  name: string;
  slug: string;
  category: string;
  description: string;
  symptoms: string[];
  priceFromLabel: string;
}

export interface AssistantArticle {
  title: string;
  slug: string;
  content: string;
  metaDescription: string | null;
}

export interface AssistantRom {
  name: string;
}

export type AssistantSiteSetting = {
  whatsappNumber: string | null;
  minPriceLabel: string;
} | null;

export interface AssistantKnowledge {
  services: AssistantService[];
  articles: AssistantArticle[];
  roms: AssistantRom[];
  siteSetting: AssistantSiteSetting;
}

export const DEFAULT_QUICK_PROMPTS = [
  "Biaya servis mulai berapa?",
  "Cara servis remote gimana?",
  "HP saya bootloop / stuck logo",
  "Daftar Custom ROM apa saja?",
];

const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "ini", "itu", "untuk", "dengan", "atau",
  "ada", "bisa", "apa", "saja", "saya", "aku", "gw", "gue", "mau", "ingin",
  "tanya", "dong", "kak", "min", "gan", "mas", "bro", "ya", "kah", "gak",
  "ga", "nggak", "tidak", "kalau", "kalo", "nya", "hp", "handphone", "ponsel",
  "android", "device", "perangkat", "cara", "bagaimana", "gimana", "soal",
  "tentang", "seputar", "mohon", "tolong", "info", "informasi", "apakah",
]);

const SYNONYMS: Record<string, string[]> = {
  matot: ["unbrick", "hardbrick", "brick", "edl", "9008", "mati"],
  mati: ["unbrick", "hardbrick", "brick"],
  nyangkut: ["stuck", "logo", "bootloop"],
  mentok: ["stuck", "logo", "bootloop"],
  restart: ["bootloop", "stuck"],
  ubl: ["unlock", "bootloader"],
  cusrom: ["custom", "rom"],
  ksu: ["kernelsu", "root"],
  magisk: ["root", "magisk"],
  twrp: ["recovery", "custom"],
  orangefox: ["recovery", "custom"],
  flashing: ["flash", "firmware", "rom"],
  frp: ["frp", "bypass", "akun", "google"],
  mbanking: ["m-banking", "banking", "root"],
  banking: ["m-banking", "root"],
  ojol: ["ojol", "root"],
  ongkos: ["harga", "biaya"],
  tarif: ["harga", "biaya"],
  bayar: ["harga", "biaya"],
  berapa: ["harga", "biaya"],
  alamat: ["lokasi", "toko"],
  dimana: ["lokasi", "toko"],
  cod: ["lokasi", "offline", "toko"],
  online: ["remote", "jarak", "jauh"],
  anydesk: ["remote"],
  ultraviewer: ["remote"],
  teamviewer: ["remote"],
};

const ANDROID_BRANDS = [
  "xiaomi", "redmi", "poco", "samsung", "realme", "oppo", "vivo",
  "asus", "rog", "zenfone", "infinix", "tecno", "pixel", "oneplus",
  "motorola", "iqoo", "nothing", "huawei", "sony",
];

function summarizeText(text: string, max = 185) {
  const first = text.split(/\n\s*\n/)[0] ?? text;
  const flat = first
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-•*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (flat.length <= max) return flat;
  const cut = flat.lastIndexOf(" ", max);
  return `${flat.slice(0, cut > 0 ? cut : max).trim()}…`;
}

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string) {
  const raw = normalize(input).split(" ").filter(Boolean);
  const expanded = new Set<string>();
  for (const word of raw) {
    if (word.length < 2) continue;
    if (!STOPWORDS.has(word)) expanded.add(word);
    const syns = SYNONYMS[word];
    if (syns) {
      for (const s of syns) expanded.add(s);
    }
  }
  return Array.from(expanded);
}

function buildWhatsappUrl(rawNumber: string | null | undefined, text: string) {
  if (!rawNumber || !rawNumber.trim()) return undefined;
  const clean = normalizePhone(rawNumber);
  if (clean.length < 10) return undefined;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

function scoreText(tokens: string[], text: string, weight: number) {
  if (!text || tokens.length === 0) return 0;
  const hay = normalize(text);
  let score = 0;
  for (const token of tokens) {
    if (hay.includes(token)) {
      score += token.length >= 4 ? weight : weight * 0.7;
    }
  }
  return score;
}

function findBestService(tokens: string[], services: AssistantService[]) {
  let best: { service: AssistantService; score: number } | null = null;
  for (const service of services) {
    const score =
      scoreText(tokens, service.name, 5) +
      scoreText(tokens, service.slug.replace(/-/g, " "), 4.5) +
      scoreText(tokens, service.category, 2) +
      scoreText(tokens, service.symptoms.join(" "), 3) +
      scoreText(tokens, service.description, 1);

    if (score > (best?.score ?? 0)) {
      best = { service, score };
    }
  }
  return best && best.score >= 5 ? best : null;
}

function findBestArticle(tokens: string[], articles: AssistantArticle[]) {
  let best: { article: AssistantArticle; score: number } | null = null;
  for (const article of articles) {
    const score =
      scoreText(tokens, article.title, 4.5) +
      scoreText(tokens, article.slug.replace(/-/g, " "), 3.5) +
      scoreText(tokens, article.metaDescription ?? "", 2) +
      scoreText(tokens, article.content.slice(0, 800), 0.6);

    if (score > (best?.score ?? 0)) {
      best = { article, score };
    }
  }
  return best && best.score >= 5 ? best : null;
}

export function replyFromKnowledge(
  rawQuery: string,
  knowledge: AssistantKnowledge
): AssistantReply {
  const query = rawQuery.trim();
  const norm = normalize(query);
  const tokens = tokenize(query);
  const { services, articles, roms, siteSetting } = knowledge;
  const priceLabel = siteSetting?.minPriceLabel || "mulai dari Rp50.000";
  const waNumber = siteSetting?.whatsappNumber;

  const waFallbackLink: AssistantLink[] = waNumber
    ? []
    : [{ label: "Buka Form Konsultasi", href: "/#konsultasi" }];

  // 1. Sapaan singkat tanpa pertanyaan spesifik
  if (
    /^(halo|hai|hi|hello|p|ping|assalamualaikum|selamat\s+(pagi|siang|sore|malam))$/.test(
      norm
    )
  ) {
    return {
      messages: [
        "Halo! Saya asisten otomatis TechFixSoftware. Silakan ceritakan kendala HP Android Anda atau pilih topik cepat di bawah.",
      ],
      suggestions: DEFAULT_QUICK_PROMPTS,
    };
  }

  // 2. Klarifikasi jika menanyakan iPhone / iOS
  if (/\b(iphone|ios|ipad|icloud|apple)\b/.test(norm)) {
    return {
      messages: [
        "TechFixSoftware saat ini khusus menangani servis software perangkat Android (Xiaomi, Poco, Samsung, Oppo, Vivo, Realme, Pixel, Asus, dll.) dan belum melayani iPhone/iOS.",
      ],
      links: [{ label: "Lihat Katalog Layanan Android", href: "/services" }],
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 3. Daftar Custom ROM
  if (
    /\b(custom\s*rom|cusrom|lineage|pixelos|crdroid|evolution|arrowos|risingos|derpfest|dotos|daftar\s*rom|list\s*rom)\b/.test(
      norm
    )
  ) {
    const romNames = roms.slice(0, 8).map((r) => r.name);
    const romText =
      romNames.length > 0
        ? `Beberapa Custom ROM yang biasa ditangani antara lain ${romNames.join(", ")}${
            roms.length > 8 ? `, dan ${roms.length - 8} ROM lainnya` : ""
          }. Ketersediaan bergantung pada tipe/codename perangkat Anda.`
        : "Kami melayani pemasangan berbagai Custom ROM Android populer (LineageOS, PixelOS, Evolution X, crDroid, dll.) sesuai ketersediaan untuk tipe perangkat Anda.";

    const customRomService = services.find((s) =>
      normalize(`${s.name} ${s.slug}`).includes("rom")
    );
    const links: AssistantLink[] = customRomService
      ? [{ label: `Detail ${customRomService.name}`, href: `/services/${customRomService.slug}` }]
      : [{ label: "Lihat Katalog Layanan", href: "/services" }];

    return {
      messages: [
        romText,
        "Sebutkan tipe HP Anda di WhatsApp agar admin bisa cek ROM yang paling stabil untuk perangkat tersebut.",
      ],
      links: [...links, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin tanya pemasangan Custom ROM.\n\nPertanyaan: ${query}`
      ),
      whatsappLabel: "Tanya ROM via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 4. Cari kecocokan layanan & artikel dari database terlebih dahulu
  const matchedService = findBestService(tokens, services);
  const matchedArticle = findBestArticle(tokens, articles);

  // Jika pengguna menanyakan topik spesifik yang lebih cocok ke artikel edukasi (mis. m-banking root, partisi A/B)
  if (
    matchedArticle &&
    (!matchedService || matchedArticle.score > matchedService.score + 1.5)
  ) {
    const summary = summarizeText(
      matchedArticle.article.metaDescription || matchedArticle.article.content,
      190
    );
    const links: AssistantLink[] = [
      { label: `Baca: ${matchedArticle.article.title}`, href: `/articles/${matchedArticle.article.slug}` },
    ];
    if (matchedService) {
      links.push({
        label: `Layanan: ${matchedService.service.name}`,
        href: `/services/${matchedService.service.slug}`,
      });
    }
    return {
      messages: [
        `Kami punya panduan lengkap soal ini: ${summary}`,
        "Jika butuh bantuan penanganan langsung oleh teknisi, Anda bisa lanjut konsultasi via WhatsApp.",
      ],
      links: [...links, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya mau konsultasi terkait: ${query}`
      ),
      whatsappLabel: "Konsultasi via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 5. Kecocokan layanan spesifik (bootloop, unbrick, root, UBL, flash, downgrade, FRP, dll.)
  if (matchedService) {
    const svc = matchedService.service;
    const summary = summarizeText(svc.description, 190);
    const links: AssistantLink[] = [
      { label: `Lihat ${svc.name}`, href: `/services/${svc.slug}` },
    ];
    if (matchedArticle) {
      links.push({
        label: `Panduan: ${matchedArticle.article.title}`,
        href: `/articles/${matchedArticle.article.slug}`,
      });
    }

    return {
      messages: [
        `${svc.name} (${svc.priceFromLabel}) — ${summary}`,
        "Untuk cek kecocokan tipe HP dan estimasi biaya final, Anda bisa langsung lanjut konsultasi via WhatsApp.",
      ],
      links: [...links, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin konsultasi layanan ${svc.name}.\n\nKeluhan: ${query}`
      ),
      whatsappLabel: "Lanjut ke WhatsApp",
      suggestions: ["Cara servis remote gimana?", "Biaya servis mulai berapa?"],
    };
  }

  // 6. Pertanyaan biaya / harga
  if (/\b(harga|biaya|tarif|berapa|ongkos|bayar|murah|mahal|estimasi)\b/.test(norm)) {
    return {
      messages: [
        `Biaya servis software Android di TechFixSoftware ${priceLabel}, tergantung tingkat kerusakan dan tipe perangkat.`,
        "Nominal final selalu disepakati di muka lewat WhatsApp sebelum pengerjaan dimulai, tanpa biaya tersembunyi.",
      ],
      links: [{ label: "Lihat Katalog Layanan", href: "/services" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin tanya estimasi biaya servis.\n\nDetail: ${query}`
      ),
      whatsappLabel: "Tanya Estimasi di WhatsApp",
      suggestions: ["Cara servis remote gimana?", "HP saya bootloop / stuck logo"],
    };
  }

  // 7. Cara kerja, servis remote, lokasi, toko fisik, keamanan, persiapan
  if (
    /\b(cara\s*kerja|alur|remote|jarak\s*jauh|online|offline|toko|alamat|lokasi|dimana|rangkasbitung|aman|syarat|persiapan|usb|anydesk|ultraviewer|teamviewer|kirim)\b/.test(
      norm
    )
  ) {
    const stepsText = SERVICE_STEPS.map((s, i) => `${i + 1}. ${s.title}`).join(" → ");
    return {
      messages: [
        `TechFixSoftware tidak memiliki toko fisik. Servis bisa dilakukan jarak jauh (remote seluruh Indonesia via PC Windows + kabel USB memakai UltraViewer/AnyDesk/TeamViewer) atau tatap muka dengan perjanjian di Rangkasbitung.`,
        `Alurnya transparan: ${stepsText}. Anda bisa memantau proses remote secara langsung di layar.`,
      ],
      links: [{ label: "Baca Cara Kerja Lengkap", href: "/cara-kerja" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin konsultasi servis software Android.\n\nPertanyaan: ${query}`
      ),
      whatsappLabel: "Mulai Konsultasi WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "HP saya bootloop / stuck logo"],
    };
  }

  // 8. Testimoni / bukti servis
  if (/\b(testimoni|bukti|review|ulasan|percaya|terpercaya|penipu|legit)\b/.test(norm)) {
    return {
      messages: [
        "Anda bisa melihat dokumentasi kasus dan tangkapan layar ulasan pelanggan yang perangkatnya sudah selesai ditangani di halaman Testimoni.",
      ],
      links: [{ label: "Lihat Testimoni & Bukti Servis", href: "/testimonials" }],
      suggestions: ["Cara servis remote gimana?", "Biaya servis mulai berapa?"],
    };
  }

  // 9. Pertanyaan merek HP Android
  const mentionedBrand = ANDROID_BRANDS.find((b) => norm.includes(b));
  if (mentionedBrand || /\b(merk|merek|tipe|brand)\b/.test(norm)) {
    return {
      messages: [
        "Kami menangani hampir semua merek Android seperti Xiaomi, Redmi, Poco, Samsung, Realme, Oppo, Vivo, Asus, Infinix, Tecno, Google Pixel, OnePlus, dan Motorola.",
        "Sampaikan tipe lengkap HP dan keluhannya lewat WhatsApp agar admin bisa langsung mengecek penanganannya.",
      ],
      links: [{ label: "Lihat Katalog Layanan", href: "/services" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin konsultasi servis perangkat Android.\n\nDetail: ${query}`
      ),
      whatsappLabel: "Konsultasi via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 10. Handoff langsung ke CS / Admin / WhatsApp
  if (/\b(wa|whatsapp|admin|cs|hubungi|kontak|konsultasi|order|pesan|servis|service)\b/.test(norm)) {
    return {
      messages: [
        "Baik, Anda bisa langsung terhubung dengan admin TechFixSoftware via WhatsApp. Cukup sebutkan tipe HP Android dan keluhannya untuk cek penanganan serta estimasi biaya.",
      ],
      links: [{ label: "Lihat Semua Layanan", href: "/services" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin konsultasi servis software Android.\n\nKeluhan: ${query}`
      ),
      whatsappLabel: "Chat Admin via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 11. Fallback ramah + tombol WhatsApp
  return {
    messages: [
      "Maaf, saya belum menemukan jawaban spesifik untuk pertanyaan tersebut. Saya bisa membantu informasi seputar layanan servis Android, estimasi biaya, cara kerja remote/offline, daftar Custom ROM, dan panduan teknis.",
      "Kalau ingin langsung dibantu teknisi, klik tombol WhatsApp di bawah agar keluhan Anda langsung diterima admin.",
    ],
    links: [
      { label: "Katalog Layanan", href: "/services" },
      { label: "Cara Kerja", href: "/cara-kerja" },
      ...waFallbackLink,
    ],
    whatsappUrl: buildWhatsappUrl(
      waNumber,
      `Halo TechFixSoftware, saya ingin bertanya:\n${query}`
    ),
    whatsappLabel: "Tanya Admin via WhatsApp",
    suggestions: DEFAULT_QUICK_PROMPTS,
  };
}
