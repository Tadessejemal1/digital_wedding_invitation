"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.replace("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 px-3 py-1.5 text-sm text-wine hover:bg-ivory disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" />
      {loading ? "…" : "Log out"}
    </button>
  );
}
