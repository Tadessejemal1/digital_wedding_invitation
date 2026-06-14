"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Fireworks } from "@/components/shared/Fireworks";
import { GuestQrCard } from "@/components/invite/GuestQrCard";
import { X } from "lucide-react";

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

const initialForm = {
  name: "",
  email: "",
  phone: "",
  attending: true,
  guestCount: 1,
  plusOne: false,
  dietaryNotes: "",
  message: "",
};

export function RsvpSection({ coupleId, slug }: RsvpSectionProps) {
  const t = useTranslations("rsvp");
  const tCheckIn = useTranslations("checkIn");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFireworks, setShowFireworks] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [submittedAttending, setSubmittedAttending] = useState(true);
  const [submittedName, setSubmittedName] = useState("");
  const [rsvpResult, setRsvpResult] = useState<RsvpResult | null>(null);

  useEffect(() => {
    if (!popupOpen) {
      setShowQr(false);
      return;
    }

    const timer = window.setTimeout(() => setShowQr(true), 3000);
    return () => window.clearTimeout(timer);
  }, [popupOpen]);

  const closePopup = () => {
    setPopupOpen(false);
    setShowQr(false);
    setRsvpResult(null);
    setShowFireworks(false);
    setForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coupleId, slug }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedName(form.name);
        setSubmittedAttending(form.attending);
        setRsvpResult(data);
        setPopupOpen(true);
        if (form.attending) setShowFireworks(true);
      } else {
        setError(data.error || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="rsvp" className="section-padding bg-wine text-white">
        {showFireworks && submittedAttending && popupOpen && <Fireworks />}
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
            {error && <p className="text-center text-sm text-red-200">{error}</p>}
          </form>
        </ScrollReveal>
      </section>

      <AnimatePresence>
        {popupOpen && rsvpResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={closePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closePopup}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-wine"
                aria-label={t("closePopup")}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pt-2 text-center">
                <p className="font-display text-2xl text-wine">{t("title")}</p>
                <p className="font-serif mt-3 text-lg text-gray-700">
                  {submittedAttending ? t("success") : t("successDeclined")}
                </p>
                {submittedAttending && (
                  <p className="mt-2 font-display text-gold">{t("fireworks")}</p>
                )}
              </div>

              <div className="mt-6">
                {!showQr ? (
                  <p className="text-center text-sm text-gray-500">{t("qrPreparing")}</p>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="mb-4 text-center text-sm text-gray-600">{tCheckIn("rsvpQrNote")}</p>
                    <GuestQrCard
                      guestName={submittedName}
                      guestId={rsvpResult.guestId}
                      qrCode={rsvpResult.qrCode}
                      status={rsvpResult.status}
                      inviteUrl={`/invite/${rsvpResult.slug || slug}?guest=${rsvpResult.guestId}`}
                      compact
                    />
                  </motion.div>
                )}
              </div>

              <div className="mt-6 text-center">
                <Button type="button" variant="outline" onClick={closePopup}>
                  {t("closePopup")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
