import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL || "admin@revix.local";
  const password = process.env.INITIAL_ADMIN_PASSWORD || "supersecretpassword123";
  const name = process.env.INITIAL_ADMIN_NAME || "Admin TechFixSoftware";

  console.log(`Menyiapkan akun admin untuk: ${email}`);

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`Akun admin (${email}) sudah terdaftar di database.`);
      return;
    }

    // Create user via Better Auth API
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    console.log(`Akun admin berhasil dibuat!`);
    console.log(`Email   : ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Gagal membuat akun admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
