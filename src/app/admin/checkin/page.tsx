"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Camera, CheckCircle2, QrCode, XCircle } from "lucide-react";
import { parseQrPayload } from "@/lib/qr";

type ScanKind = "success" | "duplicate" | "error" | "";

const CAMERA_ELEMENT_ID = "entrance-qr-reader";

export default function CheckInScannerPage() {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scanKind, setScanKind] = useState<ScanKind>("");
  const [guestLabel, setGuestLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const lastCodeRef = useRef("");
  const lastScanAtRef = useRef(0);
  const linkBootstrappedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processCheckIn = useCallback(async (raw: string) => {
    const now = Date.now();
    const { qrCode, guestId } = parseQrPayload(raw);
    if (!qrCode && !guestId) return;

    const dedupeKey = qrCode || guestId || "";
    // Ignore rapid duplicate camera frames for the same code
    if (
      processingRef.current ||
      (dedupeKey === lastCodeRef.current && now - lastScanAtRef.current < 4000)
    ) {
      return;
    }

    processingRef.current = true;
    lastCodeRef.current = dedupeKey;
    lastScanAtRef.current = now;
    setLoading(true);
    setScanResult("");
    setScanKind("");
    setGuestLabel("");

    try {
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
      } else if (data.duplicate) {
        setScanKind("duplicate");
        setGuestLabel(codeLabel);
        setScanResult("Already used — QR rejected");
      } else if (data.notAttending) {
        setScanKind("error");
        setGuestLabel(codeLabel);
        setScanResult(data.error || "Entrance not allowed");
      } else {
        setScanKind("error");
        setGuestLabel(codeLabel);
        setScanResult(data.error || "Invalid invitation QR");
      }
      setScanInput("");

      // Clean ?qr= from address bar after phone-camera deep link
      if (typeof window !== "undefined" && window.location.search.includes("qr=")) {
        window.history.replaceState({}, "", "/admin/checkin");
      }
    } catch {
      setScanKind("error");
      setScanResult("Network error");
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, []);

  // Phone Camera app opens QR link → auto check-in + show result
  useEffect(() => {
    if (linkBootstrappedRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qr = params.get("qr");
    const g = params.get("g");
    if (!qr && !g) return;
    linkBootstrappedRef.current = true;
    void processCheckIn(window.location.href);
  }, [processCheckIn]);

  useEffect(() => {
    if (manualMode) return;

    let cancelled = false;
    const scanner = new Html5Qrcode(CAMERA_ELEMENT_ID);
    scannerRef.current = scanner;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 8,
            qrbox: (viewW, viewH) => {
              const side = Math.min(Math.floor(viewW * 0.75), Math.floor(viewH * 0.55), 280);
              return { width: side, height: side };
            },
            aspectRatio: 1.333,
          },
          (decoded) => {
            void processCheckIn(decoded);
          },
          () => {
            /* ignore frame-level "not found" */
          }
        );
        if (!cancelled) {
          setCameraReady(true);
          setCameraError("");
        }
      } catch (err) {
        if (!cancelled) {
          setCameraReady(false);
          setCameraError(
            err instanceof Error
              ? err.message
              : "Camera unavailable. Allow camera permission or use manual entry."
          );
          setManualMode(true);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current?.isScanning) {
        void current.stop().catch(() => undefined);
      }
      try {
        current?.clear();
      } catch {
        // ignore
      }
    };
  }, [manualMode, processCheckIn]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    await processCheckIn(scanInput);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-wine p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-2xl text-white">Entrance Scanner</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-wine">
              <Camera className="h-5 w-5" /> Point camera at invitation QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Works both ways: open this page and scan with the camera, or scan the QR with the phone
              Camera app (opens this page and shows the result). One QR = one entrance.
            </p>

            {!manualMode && (
              <div className="overflow-hidden rounded-xl border border-gold/30 bg-black">
                <div id={CAMERA_ELEMENT_ID} className="min-h-[260px] w-full" />
                {!cameraReady && !cameraError && (
                  <p className="p-4 text-center text-sm text-white/70">Starting camera…</p>
                )}
              </div>
            )}

            {cameraError && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{cameraError}</p>
            )}

            {loading && (
              <p className="text-center text-sm font-medium text-wine">Checking invitation…</p>
            )}

            {scanKind && (
              <div
                className={`flex flex-col items-center rounded-2xl p-6 text-center ${
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
                {guestLabel && <p className="mt-2 font-mono text-sm opacity-80">{guestLabel}</p>}
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant={manualMode ? "outline" : "gold"}
                className="flex-1"
                onClick={() => {
                  setManualMode(false);
                  setCameraError("");
                }}
              >
                <Camera className="mr-1 h-4 w-4" /> Camera
              </Button>
              <Button
                type="button"
                variant={manualMode ? "gold" : "outline"}
                className="flex-1"
                onClick={() => setManualMode(true)}
              >
                <QrCode className="mr-1 h-4 w-4" /> Manual
              </Button>
            </div>

            {manualMode && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <Input
                  ref={inputRef}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Paste invitation code..."
                  className="text-lg"
                  disabled={loading}
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !scanInput.trim()}
                >
                  {loading ? "Checking..." : "Check In Guest"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
