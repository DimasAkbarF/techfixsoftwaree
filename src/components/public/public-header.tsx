import { getPublishedServices } from "@/lib/public-data";
import { PublicHeaderNav } from "@/components/public/public-header-nav";
import type { PublicNavKey } from "@/components/public/public-header-nav";

export type { PublicNavKey } from "@/components/public/public-header-nav";

export async function PublicHeader({
  active,
  overlay = false,
}: {
  active?: PublicNavKey;
  /** Menyatu dengan hero gelap: transparan di atas, terang setelah scroll. */
  overlay?: boolean;
}) {
  // Memakai cache bersama agar tidak memicu query DB terpisah per request.
  const allServices = await getPublishedServices();
  const services = allServices.slice(0, 8).map((service) => ({
    name: service.name,
    slug: service.slug,
  }));

  return <PublicHeaderNav active={active} overlay={overlay} services={services} />;
}
