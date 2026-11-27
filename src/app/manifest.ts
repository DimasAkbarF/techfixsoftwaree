import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Layanan Servis Software Android`,
    short_name: SITE_NAME,
    description:
      "Spesialis servis software Android jarak jauh (remote) & tatap muka: bootloop, unbrick, flash firmware, root, custom ROM, dan downgrade.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f6",
    theme_color: "#0b1220",
    icons: [
      {
        src: "/icons/icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
