"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuestQrCard } from "@/components/invite/GuestQrCard";
import { ShieldCheck } from "lucide-react";

interface InvitationQrSectionProps {
  coupleId: string;
  slug: string;
}

interface LookupResult {
  id: string;
  name: string;
  qrCode: string;
  status: string;
}

export function InvitationQrSection({ coupleId, slug }: InvitationQrSectionProps) {
  const t = useTranslations("checkIn");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState<LookupResult | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGuest(null);

    try {
      const res = await fetch(
        `/api/guests/lookup?coupleId=${encodeURIComponent(coupleId)}&q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("notFound"));
        return;
      }

      setGuest(data);
    } catch {
      setError(t("lookupError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="check-in" className="section-padding bg-gradient-to-b from-white to-ivory">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <ScrollReveal>
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-wine/20 bg-wine/5 p-4 text-sm text-wine">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{t("notice")}</p>
          </div>

          {!guest ? (
            <form onSubmit={handleLookup} className="mx-auto max-w-md space-y-4">
              <div>
                <Label htmlFor="guest-lookup">{t("searchLabel")}</Label>
                <Input
                  id="guest-lookup"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="mt-1"
                  required
                />
              </div>
              {error && <p className="text-center text-sm text-red-600">{error}</p>}
              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? t("searching") : t("findQr")}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <GuestQrCard
                guestName={guest.name}
                guestId={guest.id}
                qrCode={guest.qrCode}
                status={guest.status}
                inviteUrl={`/invite/${slug}?guest=${guest.id}`}
              />
              <div className="text-center">
                <Button variant="outline" onClick={() => setGuest(null)}>
                  {t("searchAgain")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
