import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Simple .env loader (project tidak memakai dotenv).
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();
const prisma = new PrismaClient();

const ROMS = [
  { name: "LineageOS", logoUrl: "/roms/lineageos.png" },
  { name: "Pixel Experience", logoUrl: "/roms/pixelexperience.png" },
  { name: "Evolution X", logoUrl: "/roms/evolutionx.png" },
  { name: "crDroid", logoUrl: "/roms/crdroid.png" },
  { name: "ArrowOS", logoUrl: "/roms/arrowos.png" },
  { name: "RisingOS", logoUrl: "/roms/risingos.png" },
  { name: "PixelOS", logoUrl: "/roms/pixelos.png" },
  { name: "DerpFest", logoUrl: "/roms/derpfest.png" },
  { name: "Project Elixir", logoUrl: "/roms/projectelixir.png" },
  { name: "SuperiorOS", logoUrl: "/roms/superioros.png" },
  { name: "Cherish OS", logoUrl: "/roms/cherishos.png" },
  { name: "dotOS", logoUrl: "/roms/dotos.png" },
  { name: "PixysOS", logoUrl: "/roms/pixysos.png" },
  { name: "Resurrection Remix", logoUrl: "/roms/resurrectionremix.png" },
];

async function main() {
  // Idempoten: lewati nama yang sudah ada agar urutan/logo hasil edit admin tidak tertimpa.
  let created = 0;
  for (const [index, rom] of ROMS.entries()) {
    const existing = await prisma.rom.findFirst({ where: { name: rom.name } });
    if (existing) continue;
    await prisma.rom.create({
      data: { ...rom, sortOrder: index, isPublished: true },
    });
    created += 1;
  }
  console.log(`Seed ROM selesai: ${created} baru, ${ROMS.length - created} sudah ada.`);
}

main()
  .catch((error) => {
    console.error("Gagal menyimpan ROM:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
