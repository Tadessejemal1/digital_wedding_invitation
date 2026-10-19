"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GuestQrCard } from "@/components/invite/GuestQrCard";
import { resolveGuestInviteCode } from "@/lib/guest-invite-url";

interface EntranceCardSectionProps {
  coupleId: string;
  slug: string;
  /** From personal path /CODE — preferred over query/session. */
  inviteCode?: string;
}

interface EntrancePayload {
  guestId: string;
  name: string;
  qrCode: string;
  status: string;
}

/** Shown when guest has a personal invite (path, query, or persisted session). */
export function EntranceCardSection({ slug, inviteCode: pathInviteCode }: EntranceCardSectionProps) {
  const t = useTranslations("checkIn");
  const [inviteCode, setInviteCode] = useState(() =>
    (pathInviteCode || "").trim().toUpperCase()
  );
  const [data, setData] = useState<EntrancePayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = resolveGuestInviteCode(pathInviteCode);
    setInviteCode(code);
  }, [pathInviteCode]);

  useEffect(() => {
    if (!inviteCode) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(
      `/api/guests/entrance-qr?code=${encodeURIComponent(inviteCode)}&slug=${encodeURIComponent(slug)}`
    )
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || t("invalidInvite"));
        return json as EntrancePayload;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || t("invalidInvite"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inviteCode, slug, t]);

  if (!inviteCode) return null;

  return (
    <section id="check-in" className="section-padding bg-gradient-to-b from-white to-ivory">
      <SectionHeading title={t("cardTitle")} subtitle={t("cardSubtitle")} />

      <ScrollReveal>
        <div className="mx-auto max-w-md">
          {loading && (
            <div className="rounded-2xl border border-gold/20 bg-white p-10 text-center text-sm text-gray-500 shadow">
              {t("loadingCard")}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && data && (
            <GuestQrCard
              guestName={data.name}
              guestId={data.guestId}
              qrCode={data.qrCode}
              status={data.status}
            />
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
