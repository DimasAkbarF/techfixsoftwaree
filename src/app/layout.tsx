import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { getPublicSiteSetting } from "@/lib/public-data";
import { SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

// Font di-self-host agar tidak ada request render-blocking ke fonts.googleapis.com.
const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const sansFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const DESCRIPTION =
  "Spesialis servis software Android: bootloop, brick, stuck logo, root, flashing, dan downgrade. Konsultasi langsung via WhatsApp.";
const TITLE = "TechFixSoftware — Layanan Servis Software Android";

export const metadata: Metadata = {
  // Prasyarat canonical, OG image, dan JSON-LD agar URL-nya absolut.
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "servis software android",
    "jasa root android",
    "jasa unbrick android",
    "fix bootloop android",
    "flash firmware android",
    "install custom rom",
    "unlock bootloader",
    "downgrade android",
    "servis hp remote",
    "servis android rangkasbitung",
    "techfixsoftware",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    other: {
      "msvalidate.01": "EC630AC9AE8193380276A1EB46EA62FE",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

/** Ubah nomor WhatsApp tersimpan (62…) jadi format E.164. */
function toE164(raw: string | null) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "").replace(/^0/, "62");
  return digits.length >= 10 ? `+${digits}` : null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setting = await getPublicSiteSetting();
  const phone = toE164(setting?.whatsappNumber ?? null);

  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        alternateName: "TechFix Software Indonesia",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/techfix-software.png`,
        image: `${SITE_URL}/brand/techfix-software.png`,
        description:
          "Pusat jasa servis software Android remote terpercaya di Indonesia: mengatasi bootloop, hardbrick, stuck logo, flash firmware, root Magisk/KernelSU, custom ROM, unlock bootloader, dan downgrade OS tanpa perlu ke toko fisik.",
        areaServed: [
          { "@type": "Country", "name": "Indonesia" },
          { "@type": "City", "name": "Rangkasbitung" },
        ],
        priceRange: "Rp50.000+",
        currenciesAccepted: "IDR",
        paymentAccepted: "Bank Transfer, QRIS, E-Wallet",
        knowsAbout: [
          "Jasa Servis Software Android",
          "Flash Firmware Android",
          "Perbaikan HP Bootloop dan Stuck Logo",
          "Unbrick Hardbrick EDL 9008",
          "Root Android Magisk KernelSU",
          "Install Custom ROM LineageOS PixelOS",
          "Unlock Bootloader UBL",
          "Bypass FRP Google Account",
          "Custom Recovery TWRP OrangeFox",
          "Downgrade OS Android",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Layanan Servis Software Android",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Perbaikan Bootloop & Stuck Logo",
                description: "Penanganan HP Android gagal booting atau nyangkut logo.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Unbrick Android (Hardbrick/Softbrick)",
                description: "Pemulihan perangkat mati total via mode EDL atau Fastboot.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Jasa Root Android & Modul",
                description: "Rooting aman via Magisk atau KernelSU.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Pemasangan Custom ROM",
                description: "Upgrade performa dan sistem operasi terbaru untuk Android lawas.",
              },
            },
          ],
        },
        ...(phone ? { telephone: phone } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "id-ID",
        publisher: { "@id": `${SITE_URL}/#business` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: SITE_AUTHOR.name,
        jobTitle: SITE_AUTHOR.role,
        description: SITE_AUTHOR.bio,
        worksFor: { "@id": `${SITE_URL}/#business` },
        knowsAbout: [
          "Root Android",
          "Bootloop",
          "Unbrick EDL 9008",
          "Flash Firmware",
          "Custom ROM",
          "Custom Recovery",
        ],
      },
    ],
  };

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${headingFont.variable} ${sansFont.variable} ${monoFont.variable}`}
    >
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]"
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius)] focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Lewati ke konten
        </a>
        <JsonLd data={organization} />
        {children}
      </body>
    </html>
  );
}
