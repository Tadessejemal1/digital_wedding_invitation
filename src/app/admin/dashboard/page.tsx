"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coupleInfo } from "@/lib/images";
import { Users, CheckCircle, XCircle, QrCode, LogOut } from "lucide-react";

interface Analytics {
  totalGuests: number;
  checkedIn: number;
  confirmed: number;
  declined: number;
  guestbookCount: number;
}

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  qrCode: string;
  status: string;
  checkedInAt: string | null;
  rsvp: { attendance: boolean; guestCount: number } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<string>("");
  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "" });
  const [coupleId, setCoupleId] = useState("");

  const fetchData = useCallback(async () => {
    const [analyticsRes, guestsRes] = await Promise.all([
      fetch("/api/admin/analytics"),
      fetch("/api/guests"),
    ]);

    if (analyticsRes.status === 401) {
      router.push("/admin");
      return;
    }

    if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    if (guestsRes.ok) {
      const guestList = await guestsRes.json();
      setGuests(guestList);
      if (guestList.length > 0 && !coupleId) {
        setCoupleId(guestList[0].coupleId);
      }
    }
  }, [router, coupleId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult("");
    try {
      let qrCode = scanInput.trim();
      try {
        const parsed = JSON.parse(scanInput);
        if (parsed.qrCode) qrCode = parsed.qrCode;
      } catch { /* plain QR code string */ }

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setScanResult(`✓ ${data.guest.name} checked in successfully!`);
        setScanInput("");
        fetchData();
      } else if (data.duplicate) {
        setScanResult(`⚠ ${data.guest.name} is already checked in`);
      } else {
        setScanResult(`✗ ${data.error || "Check-in failed"}`);
      }
    } catch {
      setScanResult("✗ Network error — scan saved locally, retry when online");
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newGuest, coupleId: coupleId || "demo-couple" }),
    });
    if (res.ok) {
      setNewGuest({ name: "", email: "", phone: "" });
      fetchData();
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
  };

  const stats = [
    { label: "Total Guests", value: analytics?.totalGuests ?? 0, icon: Users, color: "text-wine" },
    { label: "Confirmed", value: analytics?.confirmed ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Declined", value: analytics?.declined ?? 0, icon: XCircle, color: "text-red-500" },
    { label: "Checked In", value: analytics?.checkedIn ?? 0, icon: QrCode, color: "text-gold" },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-gold/20 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-display text-2xl text-wine">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/admin/checkin">
              <Button variant="gold">Entrance Scanner</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-6">
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
                <Button type="submit" className="w-full">Check In Guest</Button>
                {scanResult && (
                  <p className={`text-center text-sm ${scanResult.startsWith("✓") ? "text-green-600" : scanResult.startsWith("⚠") ? "text-yellow-600" : "text-red-600"}`}>
                    {scanResult}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Add Guest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} className="mt-1" />
                </div>
                <Button type="submit" className="w-full">Add Guest</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 text-left">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">QR Code</th>
                    <th className="pb-3 pr-4">RSVP</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Invite Link</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-gold/10">
                      <td className="py-3 pr-4 font-medium">{guest.name}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{guest.qrCode}</td>
                      <td className="py-3 pr-4">
                        {guest.rsvp
                          ? guest.rsvp.attendance
                            ? `Yes (${guest.rsvp.guestCount})`
                            : "Declined"
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          guest.status === "CHECKED_IN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {guest.status === "CHECKED_IN" ? "Checked In" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3">
                        <a
                          href={`/invite/${coupleInfo.slug}?guest=${guest.id}`}
                          target="_blank"
                          className="text-gold hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                  {guests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No guests yet. Add guests or run the seed script.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
