import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedServices } from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { HeroBackground } from "@/components/public/hero-background";
import { PublicFooter } from "@/components/public/public-footer";
import { ServiceCatalog } from "./service-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";
import { IconArrowRight } from "@tabler/icons-react";

// ISR: katalog di-cache 5 menit; admin memanggil revalidatePath("/services") saat data berubah.
export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Layanan Servis Software Android — TechFixSoftware",
  description:
    "Root, unlock bootloader, fix bootloop, unbrick, flash firmware, custom ROM, recovery, dan perbaikan software. Konsultasi WhatsApp, harga disepakati dulu.",
  path: "/services",
});

export default async function ServicesCatalogPage() {
  const services = await getPublishedServices();

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader active="katalog" />

      <section className="hero-shell">
        <HeroBackground />
        <div className="relative z-[2] mx-auto max-w-[1200px] px-4 pb-12 pt-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Layanan servis software Android
          </h1>
          <p className="mt-2 max-w-2xl text-base text-[#D7E0E5]">
            Solusi teknis penanganan bootloop, brick, stuck logo, flashing ROM, root, dan downgrade.
            Harga tidak dipajang pasti; hanya kesepakatan langsung via konsultasi WhatsApp mulai dari Rp50.000.
          </p>
          <Link
            href="/cara-kerja"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7DD3FC] hover:underline"
          >
            Cara kerja layanan
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <main id="main" className="max-w-[1200px] mx-auto px-4 py-10">
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Katalog Layanan", path: "/services" },
          ])}
        />

        <ServiceCatalog services={services} />
      </main>

      <PublicFooter />
    </div>
  );
}
