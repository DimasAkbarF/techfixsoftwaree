"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { IconLock, IconLoader2 } from "@tabler/icons-react";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        message?: string;
        code?: string;
      } | null;

      if (!res.ok) {
        if (res.status === 401 || payload?.code === "INVALID_EMAIL_OR_PASSWORD") {
          setError("Email atau password salah.");
        } else {
          setError(payload?.message || `Gagal masuk (HTTP ${res.status}).`);
        }
        setLoading(false);
        return;
      }

      // Full navigation memastikan middleware & Server Component langsung membaca cookie sesi baru.
      window.location.assign("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Terjadi kesalahan koneksi. Muat ulang halaman lalu coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-8 rounded-[var(--radius)] shadow-xs">
        <div className="flex flex-col items-center mb-6">
          <BrandLogo className="h-10 mb-4" priority />
          <h1 className="font-heading text-xl font-bold tracking-tight text-[var(--color-primary)]">
            Admin TechFixSoftware
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            Masuk ke panel manajemen operasional
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2 mt-2"
            variant="secondary"
            disabled={loading}
          >
            {loading ? (
              <>
                <IconLoader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <IconLock className="w-4 h-4" />
                Masuk
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          Akses terbatas. Registrasi publik tidak dibuka.
        </p>
      </div>
    </div>
  );
}
