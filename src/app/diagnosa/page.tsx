import type { Metadata } from "next";
import { getPublicSiteSetting } from "@/lib/public-data";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { QuickDiagnosis } from "@/components/public/quick-diagnosis";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb, pageSeo } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageSeo({
  title: "Diagnosa Cepat Kendala HP Android — TechFixSoftware",
  description:
    "Cek kendala software Android Anda dalam 3 langkah: bootloop, hardbrick EDL 9008, stuck fastboot, root Magisk/KernelSU, atau custom ROM. Dapatkan rekomendasi layanan & estimasi awal.",
  path: "/diagnosa",
});

export default async function DiagnosaPage() {
  const setting = await getPublicSiteSetting();

  return (
    <div className="page-canvas min-h-screen">
      <PublicHeader />

      <section className="page-header">
        <div className="relative z-[1] mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#34d399]">
              3 Langkah Singkat
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white">
              Diagnosa cepat kendala HP Android
            </h1>
            <p className="mt-2 text-base leading-relaxed text-white/75">
              Bingung apakah HP Anda termasuk bootloop, brick, atau perlu flashing? Pilih merek,
              gejala, dan ketersediaan PC untuk melihat rekomendasi penanganan yang tepat sebelum
              chat WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
        <JsonLd
          data={breadcrumb([
            { name: "Beranda", path: "/" },
            { name: "Diagnosa Cepat", path: "/diagnosa" },
          ])}
        />

        <QuickDiagnosis
          whatsappNumber={setting?.whatsappNumber ?? null}
          minPriceLabel={setting?.minPriceLabel || "mulai dari Rp50.000"}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
