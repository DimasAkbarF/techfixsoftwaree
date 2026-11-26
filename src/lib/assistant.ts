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
  unbrik: ["unbrick", "hardbrick", "brick"],
  nyangkut: ["stuck", "logo", "bootloop"],
  mentok: ["stuck", "logo", "bootloop"],
  botlop: ["bootloop", "stuck", "logo"],
  botloop: ["bootloop", "stuck", "logo"],
  restart: ["bootloop", "stuck"],
  ubl: ["unlock", "bootloader"],
  cusrom: ["custom", "rom"],
  ksu: ["kernelsu", "root"],
  kernsu: ["kernelsu", "root"],
  magisk: ["root", "magisk"],
  magiks: ["root", "magisk"],
  twrp: ["recovery", "custom"],
  twpr: ["recovery", "custom"],
  orangefox: ["recovery", "custom"],
  flashing: ["flash", "firmware", "rom"],
  flasing: ["flash", "firmware", "rom"],
  downgred: ["downgrade"],
  frp: ["frp", "bypass", "akun", "google"],
  mbanking: ["m-banking", "banking", "root"],
  banking: ["m-banking", "root"],
  ojol: ["ojol", "root"],
  ongkos: ["harga", "biaya"],
  tarif: ["harga", "biaya"],
  biya: ["biaya", "harga"],
  hrga: ["harga", "biaya"],
  berapa: ["harga", "biaya"],
  alamat: ["lokasi", "toko"],
  dimana: ["lokasi", "toko"],
  cod: ["lokasi", "offline", "toko"],
  online: ["remote", "jarak", "jauh"],
  remout: ["remote"],
  remot: ["remote"],
  anydesk: ["remote"],
  ultraviewer: ["remote"],
  teamviewer: ["remote"],
};

const ANDROID_BRANDS = [
  "xiaomi", "redmi", "poco", "samsung", "realme", "oppo", "vivo",
  "asus", "rog", "zenfone", "infinix", "tecno", "pixel", "oneplus",
  "motorola", "iqoo", "nothing", "huawei", "sony",
];

const CONFUSED_RESPONSES = [
  "Hmm... 🤔 saya agak bingung nih nangkap maksudnya. Sepertinya pertanyaan itu di luar topik servis software Android TechFixSoftware ya?",
  "Waduh, saya jadi garuk-garuk kepala nih 😅 Maaf ya, saya cuma paham seputar servis software Android di TechFixSoftware (bootloop, unbrick, root, custom ROM, biaya, atau cara servis remote).",
  "Ehh bentar... saya agak nge-lag memproses pertanyaan itu 🤔 Coba tanyakan seputar kendala HP Android Anda, atau kalau butuh info lain langsung tanya admin saja ya!",
];

function summarizeText(text: string, max = 195) {
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

function isWithinOneEdit(a: string, b: string) {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
    } else {
      edits += 1;
      if (edits > 1) return false;
      if (la > lb) i += 1;
      else if (lb > la) j += 1;
      else {
        i += 1;
        j += 1;
      }
    }
  }
  return true;
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
  const hayWords = hay.split(" ").filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (hay.includes(token)) {
      score += token.length >= 4 ? weight : weight * 0.7;
    } else if (token.length >= 5) {
      // Toleransi typo 1 huruf untuk kata panjang (mis. botlop, unbrik, downgred).
      if (hayWords.some((w) => w.length >= 4 && isWithinOneEdit(token, w))) {
        score += weight * 0.75;
      }
    }
  }
  return score;
}

interface ExtractedFaq {
  question: string;
  answer: string;
  service: AssistantService;
}

function extractServiceFaqs(services: AssistantService[]): ExtractedFaq[] {
  const out: ExtractedFaq[] = [];
  for (const service of services) {
    const matches = service.description.matchAll(/###\s+([^\n?]+\?)\s*\n+([^\n#]+)/g);
    for (const match of matches) {
      const question = match[1]?.trim();
      const answer = match[2]?.trim();
      if (question && answer) {
        out.push({ question, answer, service });
      }
    }
  }
  return out;
}

function findBestFaq(tokens: string[], services: AssistantService[]) {
  const faqs = extractServiceFaqs(services);
  let best: { faq: ExtractedFaq; score: number } | null = null;
  for (const faq of faqs) {
    const score =
      scoreText(tokens, faq.question, 4.5) + scoreText(tokens, faq.answer, 0.8);
    if (score > (best?.score ?? 0)) {
      best = { faq, score };
    }
  }
  return best && best.score >= 9.5 ? best : null;
}

function findBestService(tokens: string[], services: AssistantService[]) {
  let best: { service: AssistantService; score: number } | null = null;
  for (const service of services) {
    const score =
      scoreText(tokens, service.name, 5) +
      scoreText(tokens, service.slug.replace(/-/g, " "), 4.5) +
      scoreText(tokens, service.category, 2) +
      scoreText(tokens, service.symptoms.join(" "), 3) +
      scoreText(tokens, service.description, 0.8);

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

function pickConfusedMessage(query: string) {
  let hash = 0;
  for (let i = 0; i < query.length; i += 1) {
    hash = (hash * 31 + query.charCodeAt(i)) >>> 0;
  }
  return CONFUSED_RESPONSES[hash % CONFUSED_RESPONSES.length];
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

  // 1. Sapaan singkat
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

  // 2. Ucapan terima kasih / penutup
  if (/^(terima\s*kasih|makasih|makasi|thanks|thank\s*you|tq|thx|oke|ok|siap|sip|mantap|paham)(\s+(min|kak|gan|mas|bro|bang))?$/.test(norm)) {
    return {
      messages: [
        "Sama-sama! Jika suatu saat HP Android Anda butuh bantuan servis software, silakan chat lagi atau langsung hubungi kami lewat WhatsApp ya.",
      ],
      suggestions: ["Lihat biaya servis", "Cara servis remote gimana?"],
    };
  }

  // 3. Klarifikasi iPhone / iOS
  if (/\b(iphone|ios|ipad|icloud|apple)\b/.test(norm)) {
    return {
      messages: [
        "TechFixSoftware saat ini khusus menangani servis software perangkat Android (Xiaomi, Poco, Samsung, Oppo, Vivo, Realme, Pixel, Asus, dll.) dan belum melayani iPhone/iOS.",
      ],
      links: [{ label: "Lihat Katalog Layanan Android", href: "/services" }],
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 4. Klarifikasi Hardware vs Software (LCD pecah, baterai, kena air, IC)
  if (
    /\b(lcd|layar\s*pecah|retak|baterai|batre|kembung|speaker|kamera|mic|kena\s*air|kebanting|jatuh|ganti\s*layar|ganti\s*baterai|hardware|sparepart|ic\s*power|emmc\s*rusak)\b/.test(
      norm
    )
  ) {
    return {
      messages: [
        "TechFixSoftware adalah spesialis servis software Android (bootloop, unbrick software, flash firmware, root, custom ROM, UBL, downgrade) dan tidak melayani penggantian sparepart/hardware fisik seperti LCD pecah, baterai, atau IC.",
        "Kalau Anda ragu apakah kerusakannya di software atau hardware, silakan konsultasikan gejalanya lewat WhatsApp — kami akan cek secara jujur terlebih dahulu.",
      ],
      links: [{ label: "Lihat Layanan Software Kami", href: "/services" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya mau tanya apakah kendala HP saya termasuk software atau hardware:\n${query}`
      ),
      whatsappLabel: "Cek Kendala via WhatsApp",
      suggestions: ["HP saya bootloop / stuck logo", "Cara servis remote gimana?"],
    };
  }

  // 5. Metode pembayaran
  if (/\b(pembayaran|metode\s*bayar|transfer|qris|dana|ovo|gopay|shopeepay|ewallet|e-wallet|rekening|dp)\b/.test(norm)) {
    return {
      messages: [
        "Pembayaran di TechFixSoftware mendukung Transfer Bank, QRIS, dan E-Wallet.",
        `Biaya servis ${priceLabel} dan nominal final selalu disepakati dulu lewat WhatsApp sebelum pengerjaan dimulai.`,
      ],
      links: [{ label: "Lihat Cara Kerja Layanan", href: "/cara-kerja" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin tanya detail pembayaran & estimasi servis.\n\nPertanyaan: ${query}`
      ),
      whatsappLabel: "Tanya Admin via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 6. Tidak punya PC / Laptop untuk remote
  if (/\b(gak\s*punya\s*(pc|laptop)|tidak\s*punya\s*(pc|laptop)|tanpa\s*(pc|laptop)|hp\s*doang|cuma\s*punya\s*hp)\b/.test(norm)) {
    return {
      messages: [
        "Untuk servis jarak jauh (remote), memang dibutuhkan PC/laptop Windows dan kabel USB data (bisa memakai laptop sendiri atau pinjam sementara).",
        "Jika Anda berada di area Rangkasbitung dan sekitarnya, tersedia juga opsi tatap muka (offline) dengan perjanjian via WhatsApp — cukup bawa device dan kabel USB.",
      ],
      links: [{ label: "Baca Cara Kerja Online & Offline", href: "/cara-kerja" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya tidak punya PC/laptop dan ingin konsultasi opsi servis.\n\nDetail: ${query}`
      ),
      whatsappLabel: "Diskusi Opsi di WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "HP saya bootloop / stuck logo"],
    };
  }

  // 7. Keamanan data / hilang data / backup
  if (/\b(data\s*hilang|foto\s*hilang|chat\s*hilang|hapus\s*data|backup|reset\s*data|data\s*aman)\b/.test(norm)) {
    return {
      messages: [
        "Soal data tergantung jenis penanganannya: root pada HP yang sudah UBL tidak menghapus data; sedangkan Unlock Bootloader (UBL) dan pemulihan soft brick umumnya memicu reset data demi keamanan sistem Android.",
        "Pada kasus bootloop, kami selalu mengupayakan metode tanpa hapus data bila kondisi partisi masih memungkinkan. Semua risiko selalu dijelaskan jujur sebelum proses dimulai.",
      ],
      links: [{ label: "Lihat Katalog Layanan", href: "/services" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya mau tanya soal keamanan data untuk kendala HP saya:\n${query}`
      ),
      whatsappLabel: "Konsultasi Soal Data di WA",
      suggestions: ["Cara servis remote gimana?", "Biaya servis mulai berapa?"],
    };
  }

  // 8. Unroot / kembalikan ke standar pabrik
  if (/\b(unroot|balikin\s*pabrik|kembali\s*pabrik|hapus\s*root|lepas\s*root)\b/.test(norm)) {
    return {
      messages: [
        "Umumnya bisa. Karena TechFixSoftware memakai metode systemless root modern (Magisk / KernelSU) tanpa merusak partisi sistem asli, perangkat umumnya bisa di-unroot kembali ke kondisi standar pabrik dengan restore boot image asli.",
      ],
      links: [{ label: "Detail Layanan Root Android", href: "/services/root-android" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin konsultasi unroot / mengembalikan HP ke standar:\n${query}`
      ),
      whatsappLabel: "Konsultasi Unroot di WA",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 9. Estimasi waktu / berapa lama pengerjaan
  if (/\b(berapa\s*lama|durasi|butuh\s*waktu|estimasi\s*waktu|lama\s*pengerjaan|lama\s*servis)\b/.test(norm)) {
    return {
      messages: [
        "Durasi pengerjaan tergantung jenis kendala, tipe perangkat, dan kecepatan unduh firmware di koneksi Anda (umumnya berkisar 20–90 menit untuk sesi remote).",
        "Estimasi waktu dan jadwal pastinya selalu disepakati dulu lewat WhatsApp sebelum pengerjaan dimulai.",
      ],
      links: [{ label: "Lihat Alur Layanan", href: "/cara-kerja" }, ...waFallbackLink],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin tanya estimasi waktu pengerjaan servis:\n${query}`
      ),
      whatsappLabel: "Cek Jadwal di WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 10. Tentang TechFixSoftware / aman gak / privasi
  if (/\b(apa\s*itu\s*techfix|siapa\s*techfix|aman\s*gak|aman\s*tidak|aman\s*nggak|privasi|amanah)\b/.test(norm)) {
    return {
      messages: [
        "TechFixSoftware adalah spesialis servis software Android jarak jauh (remote ke seluruh Indonesia) dan tatap muka di Rangkasbitung.",
        "Sangat aman dan transparan: saat sesi remote (AnyDesk/UltraViewer/TeamViewer), Anda memantau langsung setiap langkah di layar komputer Anda, dan kami tidak pernah meminta akses akun pribadi atau perbankan.",
      ],
      links: [
        { label: "Cara Kerja Layanan", href: "/cara-kerja" },
        { label: "Lihat Testimoni & Bukti Servis", href: "/testimonials" },
      ],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya ingin konsultasi servis software Android.`
      ),
      whatsappLabel: "Konsultasi via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "HP saya bootloop / stuck logo"],
    };
  }

  // 11. Daftar Custom ROM
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

  // 12. Cocokkan Q&A langsung dari deskripsi layanan di DB (## Pertanyaan Umum)
  const matchedFaq = findBestFaq(tokens, services);
  if (matchedFaq) {
    return {
      messages: [
        matchedFaq.faq.answer,
        "Kalau ingin cek langsung untuk tipe HP Anda, silakan lanjut konsultasi via WhatsApp.",
      ],
      links: [
        { label: `Detail ${matchedFaq.faq.service.name}`, href: `/services/${matchedFaq.faq.service.slug}` },
        ...waFallbackLink,
      ],
      whatsappUrl: buildWhatsappUrl(
        waNumber,
        `Halo TechFixSoftware, saya mau konsultasi soal ${matchedFaq.faq.service.name}:\n${query}`
      ),
      whatsappLabel: "Konsultasi via WhatsApp",
      suggestions: ["Biaya servis mulai berapa?", "Cara servis remote gimana?"],
    };
  }

  // 13. Cari kecocokan layanan & artikel dari database
  const matchedService = findBestService(tokens, services);
  const matchedArticle = findBestArticle(tokens, articles);

  if (
    matchedArticle &&
    (!matchedService || matchedArticle.score > matchedService.score + 1.5)
  ) {
    const summary = summarizeText(
      matchedArticle.article.metaDescription || matchedArticle.article.content,
      195
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

  if (matchedService) {
    const svc = matchedService.service;
    const summary = summarizeText(svc.description, 195);
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

  // 14. Pertanyaan biaya / harga
  if (/\b(harga|hrga|biaya|biya|tarif|berapa|ongkos|bayar|murah|mahal|estimasi)\b/.test(norm)) {
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

  // 15. Cara kerja, servis remote, lokasi, toko fisik, persiapan
  if (
    /\b(cara\s*kerja|alur|remote|remot|remout|jarak\s*jauh|online|offline|toko|alamat|lokasi|dimana|rangkasbitung|syarat|persiapan|usb|anydesk|ultraviewer|teamviewer|kirim)\b/.test(
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

  // 16. Testimoni / bukti servis
  if (/\b(testimoni|bukti|review|ulasan|percaya|terpercaya|penipu|legit)\b/.test(norm)) {
    return {
      messages: [
        "Anda bisa melihat dokumentasi kasus dan tangkapan layar ulasan pelanggan yang perangkatnya sudah selesai ditangani di halaman Testimoni.",
      ],
      links: [{ label: "Lihat Testimoni & Bukti Servis", href: "/testimonials" }],
      suggestions: ["Cara servis remote gimana?", "Biaya servis mulai berapa?"],
    };
  }

  // 17. Pertanyaan merek HP Android
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

  // 18. Handoff langsung ke CS / Admin / WhatsApp
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

  // 19. Pertanyaan di luar topik website → respons kebingungan yang natural
  return {
    messages: [
      pickConfusedMessage(query),
      "Coba pilih salah satu topik di bawah, atau langsung chat admin via WhatsApp biar dibantu langsung ya!",
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
