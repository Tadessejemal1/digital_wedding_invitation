"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coupleInfo } from "@/lib/images";
import {
  Users,
  CheckCircle,
  XCircle,
  QrCode,
  Copy,
  Check,
  Share2,
  Download,
} from "lucide-react";
import { AdminGuestQrModal } from "@/components/admin/AdminGuestQrModal";

interface Analytics {
  totalGuests: number;
  checkedIn: number;
  confirmed: number;
  declined: number;
  guestbookCount: number;
  guestPhotoCount?: number;
  coupleId?: string;
}

interface Guest {
  id: string;
  coupleId?: string;
  name: string;
  email: string | null;
  phone: string | null;
  inviteCode: string;
  qrCode: string;
  status: string;
  checkedInAt: string | null;
  rsvp: { attendance: boolean; guestCount: number } | null;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<string>("");
  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "" });
  const [coupleId, setCoupleId] = useState("");
  const [addError, setAddError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastCreatedCode, setLastCreatedCode] = useState<string | null>(null);
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);
  const [bulkNames, setBulkNames] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState("");

  const fetchData = useCallback(async () => {
    const [analyticsRes, guestsRes] = await Promise.all([
      fetch("/api/admin/analytics"),
      fetch("/api/guests"),
    ]);

    if (analyticsRes.ok) {
      const a = await analyticsRes.json();
      setAnalytics(a);
      if (a.coupleId) setCoupleId(a.coupleId);
    }
    if (guestsRes.ok) {
      const guestList = await guestsRes.json();
      setGuests(guestList);
      if (guestList.length > 0 && guestList[0].coupleId) {
        setCoupleId(guestList[0].coupleId);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult("");
    try {
      let qrCode = scanInput.trim();
      try {
        const parsed = JSON.parse(scanInput);
        if (parsed.qrCode) qrCode = parsed.qrCode;
      } catch {
        /* plain QR code string */
      }

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setScanResult(`✓ ${data.guest.name} checked in — invitation used for entrance`);
        setScanInput("");
        fetchData();
      } else if (data.duplicate) {
        setScanResult(`⚠ ${data.guest.name} already checked in — one invitation, one entrance only`);
      } else if (data.notAttending) {
        setScanResult(`✗ ${data.guest?.name || "Guest"} did not confirm attendance`);
      } else if (data.notInvited) {
        setScanResult(`✗ Not an invited guest`);
      } else {
        setScanResult(`✗ ${data.error || "Check-in failed"}`);
      }
    } catch {
      setScanResult("✗ Network error — scan saved locally, retry when online");
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setLastCreatedCode(null);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newGuest,
        coupleId: coupleId || undefined,
        slug: coupleInfo.slug,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNewGuest({ name: "", email: "", phone: "" });
      setLastCreatedCode(data.inviteCode);
      if (data.coupleId) setCoupleId(data.coupleId);
      // Immediately show one-time QR ready to download & send to the guest
      setQrGuest({
        id: data.id,
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        inviteCode: data.inviteCode,
        qrCode: data.qrCode,
        status: data.status || "PENDING",
        checkedInAt: null,
        rsvp: null,
        coupleId: data.coupleId,
      });
      fetchData();
    } else {
      setAddError(data.error || "Failed to add guest");
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkResult("");
    setAddError("");
    const names = bulkNames
      .split(/\r?\n/)
      .map((line) => line.split(",")[0]?.trim() || "")
      .filter(Boolean);

    if (names.length === 0) {
      setBulkResult("✗ Paste at least one name (one per line)");
      return;
    }

    setBulkLoading(true);
    try {
      const res = await fetch("/api/guests/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names,
          coupleId: coupleId || undefined,
          slug: coupleInfo.slug,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkResult(`✓ Imported ${data.count} guests — copy personal links from the list below`);
        setBulkNames("");
        fetchData();
      } else {
        setBulkResult(`✗ ${data.error || "Import failed"}`);
      }
    } catch {
      setBulkResult("✗ Network error");
    } finally {
      setBulkLoading(false);
    }
  };

  const siteOrigin = () => {
    if (typeof window !== "undefined" && window.location.origin) {
      return window.location.origin.replace(/\/$/, "");
    }
    return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.entro-wedding.com").replace(
      /\/$/,
      ""
    );
  };

  const personalInviteLink = (inviteCode: string) => {
    // English default (no /en), opens at hero like the public site
    return `${siteOrigin()}/${inviteCode.trim().toUpperCase()}`;
  };

  /** One share URL per line — easy to paste into WhatsApp / Telegram. */
  const allLinksOnlyText = guests
    .map((g) => personalInviteLink(g.inviteCode))
    .join("\n");

  /** Code + link pairs for labeled sharing. */
  const inviteListText = guests
    .map((g) => `${g.inviteCode}\n${personalInviteLink(g.inviteCode)}`)
    .join("\n\n");

  const downloadAllLinks = () => {
    const blob = new Blob([allLinksOnlyText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-invite-links-${guests.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total Guests", value: analytics?.totalGuests ?? 0, icon: Users, color: "text-wine" },
    { label: "Confirmed", value: analytics?.confirmed ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Declined", value: analytics?.declined ?? 0, icon: XCircle, color: "text-red-500" },
    { label: "Checked In", value: analytics?.checkedIn ?? 0, icon: QrCode, color: "text-gold" },
  ];

  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <h1 className="font-display text-2xl text-wine sm:text-3xl">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-wine">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gold/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Share all invitation links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Public wedding site:{" "}
              <a
                href="https://www.entro-wedding.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-wine underline"
              >
                https://www.entro-wedding.com/
              </a>
              . Each guest gets a personal link like{" "}
              <span className="font-mono text-xs text-wine">
                https://www.entro-wedding.com/EDENAND12R-01
              </span>
              .
            </p>
            <p className="text-sm text-gray-500">
              {guests.length} pass{guests.length === 1 ? "" : "es"} ready to share
              {guests[0] ? (
                <>
                  {" "}
                  ({guests[0].inviteCode}
                  {guests.length > 1 ? ` … ${guests[guests.length - 1]?.inviteCode}` : ""})
                </>
              ) : null}
              .
            </p>
            {guests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="gold"
                  onClick={() => copyText(allLinksOnlyText, "links-only")}
                >
                  {copiedId === "links-only" ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> All links copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" /> Copy all links
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyText(inviteListText, "bulk")}
                >
                  {copiedId === "bulk" ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Codes + links copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" /> Copy codes + links
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={downloadAllLinks}>
                  <Download className="mr-1 h-4 w-4" /> Download .txt
                </Button>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                No invitation passes in the database yet. Seed tickets or add guests first.
              </p>
            )}
            {guests.length > 0 && (
              <textarea
                readOnly
                rows={6}
                value={allLinksOnlyText}
                className="w-full rounded-md border border-gold/30 bg-white px-3 py-2 font-mono text-[11px] text-wine/90 focus:outline-none focus:ring-2 focus:ring-gold"
                onFocus={(e) => e.currentTarget.select()}
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> QR Check-In Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-500">
                Scan guest entrance invitation QR codes only — not gift registry links.
              </p>
              <form onSubmit={handleScan} className="space-y-4">
                <Input
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan QR or paste code..."
                  autoFocus
                />
                <Button type="submit" className="w-full">
                  Check In Guest
                </Button>
                {scanResult && (
                  <p
                    className={`text-center text-sm ${
                      scanResult.startsWith("✓")
                        ? "text-green-600"
                        : scanResult.startsWith("⚠")
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {scanResult}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Add Invited Guest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-500">
                For 1 guest: add name → View / Download → send the QR image. Or copy the full-site Entrance Card link.
              </p>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <Input
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Guest + Generate Invite Link
                </Button>
                {addError && <p className="text-center text-sm text-red-600">{addError}</p>}
                {lastCreatedCode && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-800">
                    Invite code:{" "}
                    <span className="font-mono font-bold tracking-wider">{lastCreatedCode}</span>
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center gap-1 text-green-700 underline"
                      onClick={() => copyText(personalInviteLink(lastCreatedCode), "new")}
                    >
                      {copiedId === "new" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy link
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bulk import (~350 guests)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-500">
              Paste <strong>one name per line</strong> (or CSV with name in the first column). The system
              creates each guest with a unique invite code + personal QR link. Then use{" "}
              <strong>Copy all personal links</strong> (full site + Entrance Card) or download each QR to send.
            </p>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                rows={10}
                placeholder={"Abebe Kebede\nAlmaz Desta\n...\n(up to 500 names)"}
                className="w-full rounded-md border border-gold/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <Button type="submit" className="w-full" disabled={bulkLoading}>
                {bulkLoading ? "Importing…" : "Import all names into database"}
              </Button>
              {bulkResult && (
                <p
                  className={`text-center text-sm ${
                    bulkResult.startsWith("✓") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {bulkResult}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <CardTitle>Guest List ({guests.length} passes)</CardTitle>
            {guests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyText(allLinksOnlyText, "links-only-table")}
                >
                  {copiedId === "links-only-table" ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" /> Copy all links
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 text-left">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Invite Code</th>
                    <th className="pb-3 pr-4">RSVP</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Share QR</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-gold/10">
                      <td className="py-3 pr-4 font-medium">{guest.name}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-semibold tracking-wider text-wine">
                            {guest.inviteCode}
                          </span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-left text-xs text-gold hover:underline"
                            onClick={() => copyText(personalInviteLink(guest.inviteCode), guest.id)}
                          >
                            {copiedId === guest.id ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            Copy share link
                          </button>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {guest.rsvp
                          ? guest.rsvp.attendance
                            ? `Yes (${guest.rsvp.guestCount})`
                            : "Declined"
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            guest.status === "CHECKED_IN"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {guest.status === "CHECKED_IN" ? "Checked In" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setQrGuest(guest)}
                        >
                          <QrCode className="mr-1 h-3.5 w-3.5" />
                          View / Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {guests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No guests yet. Add invited guests above (or run the seed script).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {qrGuest && (
        <AdminGuestQrModal guest={qrGuest} onClose={() => setQrGuest(null)} />
      )}
    </div>
  );
}
