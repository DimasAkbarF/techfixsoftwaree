"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { IconBrandAndroid, IconLock, IconLoader2 } from "@tabler/icons-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Email atau password salah.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-8 rounded-[var(--radius)] shadow-xs">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--color-primary)] flex items-center justify-center text-white mb-3">
            <IconBrandAndroid className="w-7 h-7 text-[var(--color-accent)]" />
          </div>
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
