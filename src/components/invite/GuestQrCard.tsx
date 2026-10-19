"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { generateQrDataUrl, getGuestQrPayload } from "@/lib/qr";
import { CheckCircle, Clock } from "lucide-react";

interface GuestQrCardProps {
  guestName?: string;
  guestId: string;
  qrCode: string;
  status?: string;
  inviteUrl?: string;
  compact?: boolean;
}

/** Door QR only — no guest name or invitation ID (anonymous entrance tickets). */
export function GuestQrCard({
  guestId,
  qrCode,
  status = "PENDING",
  inviteUrl,
  compact = false,
}: GuestQrCardProps) {
  const t = useTranslations("checkIn");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    const origin =
      typeof window !== "undefined"
        ? window.location.origin.replace(/\/$/, "")
        : undefined;
    const payload = getGuestQrPayload(guestId, qrCode, origin);
    generateQrDataUrl(payload).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [guestId, qrCode]);

  return (
    <div className={`rounded-2xl border border-gold/30 bg-white text-center shadow-lg ${compact ? "p-5" : "p-8"}`}>
      <div className="mx-auto my-2 flex min-h-[240px] w-full max-w-[260px] items-center justify-center rounded-xl border border-gold/20 bg-white p-4 shadow-sm">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={t("qrAlt")}
            width={220}
            height={220}
            className="h-[220px] w-[220px] object-contain"
          />
        ) : (
          <div className="h-[220px] w-[220px] animate-pulse rounded-lg bg-ivory" />
        )}
      </div>

      <p className="font-serif text-sm text-gray-600">{t("scanAtEntrance")}</p>
      <p className="mt-1 text-xs font-medium text-wine/80">{t("oneEntrance")}</p>

      <div
        className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
          status === "CHECKED_IN" ? "bg-green-100 text-green-700" : "bg-gold/10 text-wine"
        }`}
      >
        {status === "CHECKED_IN" ? (
          <>
            <CheckCircle className="h-4 w-4" /> {t("checkedIn")}
          </>
        ) : (
          <>
            <Clock className="h-4 w-4" /> {t("awaitingCheckIn")}
          </>
        )}
      </div>

      {inviteUrl && (
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-gold hover:underline"
        >
          {t("openDigitalInvite")}
        </a>
      )}
    </div>
  );
}
