"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already signed in, skip login
    void fetch("/api/admin/analytics")
      .then((res) => {
        if (res.ok) router.replace("/admin/dashboard");
      })
      .catch(() => undefined);
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Invalid password");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Login failed — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-wine/95 p-4">
      <Card className="w-full max-w-md border-gold/30 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-wine/10">
            <Lock className="h-6 w-6 text-wine" />
          </div>
          <CardTitle className="font-display text-2xl text-wine">Admin login</CardTitle>
          <p className="text-sm text-gray-500">Enter the admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="gold" className="w-full" disabled={loading || !password}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
