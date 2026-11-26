import Image from "next/image";

export function BrandLogo({
  className = "h-9",
  priority = false,
  light = false,
}: {
  className?: string;
  priority?: boolean;
  /** Versi putih + teal-emerald untuk latar gelap (header transparan di beranda). */
  light?: boolean;
}) {
  return (
    <Image
      src={light ? "/brand/techfix-software-light.png" : "/brand/techfix-software.png"}
      alt="TechFixSoftware"
      width={1378}
      height={360}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      // Logo tampil maksimal ~160 px; tanpa sizes next/image meminta varian 3840 px.
      sizes="160px"
      className={`w-auto ${className}`}
    />
  );
}
