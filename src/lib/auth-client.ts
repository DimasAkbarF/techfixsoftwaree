import { createAuthClient } from "better-auth/react";

// Gunakan origin halaman aktif di browser agar login & logout selalu menuju domain yang sama
// (localhost, preview Vercel, maupun domain produksi) tanpa hardcode localhost:3000.
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient;
