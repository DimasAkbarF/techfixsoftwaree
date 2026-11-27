import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    // Impor ikon per-simbol, bukan seluruh paket, agar bundle klien kecil.
    optimizePackageImports: ["@tabler/icons-react"],
    inlineCss: true,
    // Cache Router RSC 120s (dinamis) & 300s (statis/ISR, selaras revalidate=300) agar
    // perpindahan halaman di browser berlangsung ~5-20ms dari memori tanpa tunggu jaringan.
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
  },
  async redirects() {
    return [
      // Pemulihan 100% ranking URL lama yang masih terindeks di Google Search Console
      { source: "/about", destination: "/tentang", permanent: true },
      { source: "/how-it-works", destination: "/cara-kerja", permanent: true },
      { source: "/remote-guide", destination: "/cara-kerja", permanent: true },
      { source: "/faq", destination: "/#faq", permanent: true },
      { source: "/terms", destination: "/tentang", permanent: true },
      { source: "/disclaimer", destination: "/tentang", permanent: true },
      { source: "/categories", destination: "/services", permanent: true },
      { source: "/categories/:slug", destination: "/services/:slug", permanent: true },
      {
        source: "/guides/cara-mengatasi-hp-xiaomi-bootloop-stuck-logo-mi",
        destination: "/merek/xiaomi-poco",
        permanent: true,
      },
      {
        source: "/guides/cara-mengatasi-hp-samsung-stuck-di-logo",
        destination: "/articles/cara-mengatasi-hp-samsung-stuck-di-logo",
        permanent: true,
      },
      {
        source: "/guides/soft-brick-vs-hard-brick-perbedaan-dan-solusi",
        destination: "/articles/soft-brick-vs-hard-brick-perbedaan-dan-solusi",
        permanent: true,
      },
      { source: "/guides", destination: "/articles", permanent: true },
      { source: "/guides/:slug", destination: "/articles", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://utfs.io https://*.ufs.sh https://*.uploadthing.com",
              "font-src 'self' data:",
              "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://uploadthing.com https://*.uploadthing.com https://*.ingest.uploadthing.com https://*.ufs.sh",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        // Aset statis logo & bukti servis jarang berubah; :path+ agar tidak ikut meng-cache HTML /testimonials.
        source: "/testimonials/:path+",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/roms/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
