"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, LogOut } from "lucide-react";

export default function CheckInScannerPage() {
  const router = useRouter();
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult("");
    setLoading(true);

    try {
      let qrCode = scanInput.trim();
      try {
        const parsed = JSON.parse(scanInput);
        if (parsed.qrCode) qrCode = parsed.qrCode;
      } catch {
        /* plain code */
      }

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setScanResult(`✓ ${data.guest.name} checked in`);
        setScanInput("");
      } else if (data.duplicate) {
        setScanResult(`⚠ ${data.guest.name} already checked in`);
      } else {
        setScanResult(`✗ ${data.error || "Invalid invitation QR"}`);
      }
    } catch {
      setScanResult("✗ Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-wine p-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between text-white">
          <h1 className="font-display text-2xl">Entrance Scanner</h1>
          <Button variant="ghost" className="text-white hover:text-gold-light" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-wine">
              <QrCode className="h-5 w-5" /> Scan Invitation QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-500">
              Scan the guest entrance QR code only. This is not for gift payments.
            </p>
            <form onSubmit={handleScan} className="space-y-4">
              <Input
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan QR or paste invitation code..."
                autoFocus
                className="text-lg"
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Checking..." : "Check In Guest"}
              </Button>
              {scanResult && (
                <p
                  className={`rounded-lg p-4 text-center text-lg font-medium ${
                    scanResult.startsWith("✓")
                      ? "bg-green-100 text-green-700"
                      : scanResult.startsWith("⚠")
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {scanResult}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
