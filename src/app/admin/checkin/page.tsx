"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, QrCode, XCircle } from "lucide-react";

type ScanKind = "success" | "duplicate" | "error" | "";

export default function CheckInScannerPage() {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scanKind, setScanKind] = useState<ScanKind>("");
  const [guestLabel, setGuestLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [scanKind]);

  const resetForNextScan = () => {
    setScanInput("");
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult("");
    setScanKind("");
    setGuestLabel("");
    setLoading(true);

    try {
      let qrCode = scanInput.trim();
      let guestId: string | undefined;
      try {
        const parsed = JSON.parse(scanInput);
        if (parsed.qrCode) qrCode = String(parsed.qrCode);
        if (parsed.guestId) guestId = String(parsed.guestId);
      } catch {
        /* plain code */
      }

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode, guestId }),
      });
      const data = await res.json();
      const codeLabel = data.guest?.inviteCode || qrCode;

      if (res.ok) {
        setScanKind("success");
        setGuestLabel(codeLabel);
        setScanResult("Checked in successfully");
        resetForNextScan();
      } else if (data.duplicate) {
        setScanKind("duplicate");
        setGuestLabel(codeLabel);
        setScanResult("Already used — QR rejected");
        resetForNextScan();
      } else if (data.notAttending) {
        setScanKind("error");
        setGuestLabel(codeLabel);
        setScanResult(data.error || "Entrance not allowed");
        resetForNextScan();
      } else {
        setScanKind("error");
        setGuestLabel(codeLabel);
        setScanResult(data.error || "Invalid invitation QR");
        resetForNextScan();
      }
    } catch {
      setScanKind("error");
      setScanResult("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-wine p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 font-display text-2xl text-white">Entrance Scanner</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-wine">
              <QrCode className="h-5 w-5" /> Scan Invitation QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-500">
              One QR = one entrance. First scan succeeds and updates status. Scanning again is
              rejected.
            </p>
            <form onSubmit={handleScan} className="space-y-4">
              <Input
                ref={inputRef}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan QR or paste invitation code..."
                autoFocus
                className="text-lg"
                disabled={loading}
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading || !scanInput.trim()}>
                {loading ? "Checking..." : "Check In Guest"}
              </Button>
            </form>

            {scanKind && (
              <div
                className={`mt-6 flex flex-col items-center rounded-2xl p-6 text-center ${
                  scanKind === "success"
                    ? "bg-green-50 text-green-700"
                    : scanKind === "duplicate"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {scanKind === "success" && (
                  <CheckCircle2 className="mb-3 h-16 w-16 text-green-600" strokeWidth={1.75} />
                )}
                {scanKind === "duplicate" && (
                  <AlertTriangle className="mb-3 h-16 w-16 text-amber-600" strokeWidth={1.75} />
                )}
                {scanKind === "error" && (
                  <XCircle className="mb-3 h-16 w-16 text-red-600" strokeWidth={1.75} />
                )}
                <p className="font-display text-2xl">{scanResult}</p>
                {guestLabel && (
                  <p className="mt-2 font-mono text-sm opacity-80">{guestLabel}</p>
                )}
                {scanKind === "success" && (
                  <p className="mt-3 text-sm text-green-700/80">Status updated to Checked In</p>
                )}
                {scanKind === "duplicate" && (
                  <p className="mt-3 text-sm text-amber-800/80">
                    This pass was already used — do not allow entrance
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
