import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Simple .env.local / .env loader if dotenv is not installed
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

// Screenshot dokumentasi kasus dari situs lama (dipangkas & dikompres ke public/testimonials).
// Nama pelanggan tidak ada di screenshot; dipakai label generik agar tidak mengarang identitas.
const testimonials = [
  {
    imageUrl: "/testimonials/bukti-unbrick-custom-rom-redmi-note-9.jpg",
    customerName: "Pelanggan TechFixSoftware",
    deviceType: "Redmi Note 9",
    review:
      "Unbrick dan pemasangan custom ROM pada Redmi Note 9. Perangkat kembali menyala normal dan sistem berhasil dijalankan.",
  },
  {
    imageUrl: "/testimonials/bukti-unbrick-poco-m4-pro.jpg",
    customerName: "Pelanggan TechFixSoftware",
    deviceType: "Poco M4 Pro",
    review:
      "Unbrick Poco M4 Pro dari kondisi stuck di fastboot. Perangkat berhasil masuk kembali ke sistem.",
  },
  {
    imageUrl: "/testimonials/bukti-custom-rom-redmi-9a.jpg",
    customerName: "Pelanggan TechFixSoftware",
    deviceType: "Redmi 9A",
    review:
      "Pemasangan custom ROM pada Redmi 9A. Instalasi selesai dan perangkat menyala normal.",
  },
];

async function main() {
  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { imageUrl: testimonial.imageUrl },
    });

    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: { ...testimonial, rating: 5, isPublished: true },
      });
      console.log(`UPDATE ${testimonial.deviceType}`);
    } else {
      await prisma.testimonial.create({
        data: { ...testimonial, rating: 5, isPublished: true },
      });
      console.log(`CREATE ${testimonial.deviceType}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Gagal menyimpan testimoni:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
