"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emailGuestbookNotification } from "@/lib/web3forms-client";

export function GuestbookSection() {
  const t = useTranslations("guestbook");
  const [form, setForm] = useState({ guestName: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const payload = { guestName: form.guestName.trim(), message: form.message.trim() };

    try {
      // Best-effort save (not shown publicly)
      void fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Send wishes & blessings by email
      const emailed = await emailGuestbookNotification(payload);

      if (emailed) {
        setSuccess(true);
        setForm({ guestName: "", message: "" });
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="guestbook" className="section-padding">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-lg">
        <ScrollReveal>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gold/20 bg-white p-8 shadow-md">
            <div>
              <Label htmlFor="gb-name">{t("name")}</Label>
              <Input
                id="gb-name"
                required
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gb-message">{t("message")}</Label>
              <Textarea
                id="gb-message"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1"
                rows={4}
              />
            </div>
            <Button type="submit" variant="default" disabled={loading} className="w-full">
              {loading ? "..." : t("submit")}
            </Button>
            {success && <p className="text-center text-sm text-green-600">{t("success")}</p>}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
