"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "@/lib/date-utils";

interface GuestbookEntry {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
}

export function GuestbookSection() {
  const t = useTranslations("guestbook");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [form, setForm] = useState({ guestName: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchEntries = async () => {
    const res = await fetch("/api/guestbook");
    if (res.ok) setEntries(await res.json());
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ guestName: "", message: "" });
        fetchEntries();
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="guestbook" className="section-padding">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gold/20 bg-white p-8 shadow-md">
            <div>
              <Label htmlFor="gb-name">{t("name")}</Label>
              <Input id="gb-name" required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="gb-message">{t("message")}</Label>
              <Textarea id="gb-message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1" rows={4} />
            </div>
            <Button type="submit" variant="default" disabled={loading} className="w-full">
              {loading ? "..." : t("submit")}
            </Button>
            {success && <p className="text-center text-sm text-green-600">{t("success")}</p>}
          </form>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-gold/10 bg-ivory p-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-wine">{entry.guestName}</h4>
                  <time className="text-xs text-gray-400">{formatDistanceToNow(entry.createdAt)}</time>
                </div>
                <p className="mt-2 font-serif italic text-gray-700">{entry.message}</p>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-center font-serif italic text-gray-400">Be the first to leave a message...</p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
