"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Fireworks } from "@/components/shared/Fireworks";
import { GuestQrCard } from "@/components/invite/GuestQrCard";

interface RsvpSectionProps {
  coupleId: string;
  slug: string;
}

interface RsvpResult {
  guestId: string;
  qrCode: string;
  status: string;
  slug: string;
}

export function RsvpSection({ coupleId, slug }: RsvpSectionProps) {
  const t = useTranslations("rsvp");
  const tCheckIn = useTranslations("checkIn");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    attending: true,
    guestCount: 1,
    plusOne: false,
    dietaryNotes: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [rsvpResult, setRsvpResult] = useState<RsvpResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coupleId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setRsvpResult(data);
        if (form.attending) setShowFireworks(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="rsvp" className="section-padding bg-wine text-white">
        {showFireworks && form.attending && <Fireworks />}
        <div className="mx-auto max-w-lg text-center">
          <SectionHeading title={t("title")} className="[&_h2]:text-white" />
          <p className="font-serif text-xl">{t("success")}</p>
          {form.attending && (
            <>
              <p className="mt-4 font-display text-lg text-gold-light">{t("fireworks")}</p>
              {rsvpResult && (
                <div className="mt-8 text-left">
                  <p className="mb-4 text-center text-sm text-white/80">{tCheckIn("rsvpQrNote")}</p>
                  <GuestQrCard
                    guestName={form.name}
                    guestId={rsvpResult.guestId}
                    qrCode={rsvpResult.qrCode}
                    status={rsvpResult.status}
                    inviteUrl={`/invite/${rsvpResult.slug || slug}?guest=${rsvpResult.guestId}`}
                    compact
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="section-padding bg-wine text-white">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} className="[&_h2]:text-white [&_p]:text-white/80" />
      <ScrollReveal>
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
          <div>
            <Label htmlFor="name" className="text-white/90">{t("name")}</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-white text-black" />
          </div>

          <div>
            <Label className="text-white/90">{t("attending")}</Label>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, attending: true })}
                className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                  form.attending ? "bg-gold text-white" : "border border-white/30 text-white/70"
                }`}
              >
                {t("yes")}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, attending: false })}
                className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                  !form.attending ? "bg-gold text-white" : "border border-white/30 text-white/70"
                }`}
              >
                {t("no")}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="message" className="text-white/90">{t("message")}</Label>
            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 bg-white text-black" rows={3} />
          </div>
          
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? "..." : t("submit")}
          </Button>
        </form>
      </ScrollReveal>
    </section>
  );
}
