"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { IconLogout } from "@tabler/icons-react";

export function AdminNavLogout() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-danger)] rounded-[var(--radius)] hover:bg-[#FCE8E6] transition-colors cursor-pointer disabled:opacity-50"
    >
      <IconLogout className="w-4 h-4" />
      <span>{loggingOut ? "Keluar..." : "Keluar Sesi"}</span>
    </button>
  );
}
