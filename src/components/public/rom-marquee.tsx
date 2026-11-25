import { getPublishedRoms } from "@/lib/public-data";

// Cadangan bila tabel Rom kosong/gagal: beranda tidak boleh kehilangan pitanya.
// Logo resmi diambil dari avatar organisasi GitHub tiap proyek, lalu dipotong rapat ke 96×96.
const FALLBACK_ROMS = [
  { name: "LineageOS", logo: "/roms/lineageos.png" },
  { name: "Pixel Experience", logo: "/roms/pixelexperience.png" },
  { name: "Evolution X", logo: "/roms/evolutionx.png" },
  { name: "crDroid", logo: "/roms/crdroid.png" },
  { name: "ArrowOS", logo: "/roms/arrowos.png" },
  { name: "RisingOS", logo: "/roms/risingos.png" },
  { name: "PixelOS", logo: "/roms/pixelos.png" },
  { name: "DerpFest", logo: "/roms/derpfest.png" },
  { name: "Project Elixir", logo: "/roms/projectelixir.png" },
  { name: "SuperiorOS", logo: "/roms/superioros.png" },
  { name: "Cherish OS", logo: "/roms/cherishos.png" },
  { name: "dotOS", logo: "/roms/dotos.png" },
  { name: "PixysOS", logo: "/roms/pixysos.png" },
  { name: "Resurrection Remix", logo: "/roms/resurrectionremix.png" },
];

// Tiga salinan: setelah bergeser tepat satu salinan, dua salinan tersisa masih menutup lebar layar.
const COPIES = 3;

export async function RomMarquee() {
  const rows = await getPublishedRoms();
  const roms: Array<{ name: string; logo: string }> =
    rows.length > 0
      ? rows.map((row) => ({ name: row.name, logo: row.logoUrl }))
      : FALLBACK_ROMS;

  return (
    <section
      aria-label="Daftar Custom ROM"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 45% 220px at 0% 0%, rgba(34,208,247,.10), transparent 70%)",
      }}
    >
      {/* Full-bleed: pita logo tidak dibatasi container 1200px. */}
      {/* Animasi menggeser tepat selebar satu salinan (1/3 lintasan) agar sambungan tidak terlihat. */}
      {/* shortcut: belum ada tombol pause (WCAG 2.2.2). Pause lewat hover/focus; animasi
          sengaja tidak dimatikan oleh prefers-reduced-motion agar pita tetap bergerak. */}
      <div className="rom-mask overflow-hidden py-10 lg:py-14">
        <div className="rom-track flex w-max">
          {Array.from({ length: COPIES }, (_, copy) => (
            <ul
              key={copy}
              aria-hidden={copy > 0 ? true : undefined}
              className="flex items-center gap-8 pr-8 md:gap-12 md:pr-12"
            >
              {roms.map((rom) => (
                <li key={rom.name} className="flex items-center gap-3.5">
                  <img
                    src={rom.logo}
                    alt={`Logo ${rom.name}`}
                    width={96}
                    height={96}
                    className="h-20 w-20 shrink-0 rounded-xl bg-white object-contain ring-1 ring-white/20 md:h-24 md:w-24"
                  />
                  <span className="whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                    {rom.name}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
