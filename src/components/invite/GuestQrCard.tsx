"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { generateQrDataUrl, getGuestQrPayload } from "@/lib/qr";
import { CheckCircle, Clock, QrCode } from "lucide-react";

interface GuestQrCardProps {
  guestName: string;
  guestId: string;
  qrCode: string;
  status?: string;
  inviteUrl?: string;
  compact?: boolean;
}

export function GuestQrCard({
  guestName,
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
    const payload = getGuestQrPayload(guestId, qrCode);
    generateQrDataUrl(payload).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [guestId, qrCode]);

  return (
    <div className={`rounded-2xl border border-gold/30 bg-white text-center shadow-lg ${compact ? "p-5" : "p-8"}`}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-wine/10 px-4 py-2 text-sm text-wine">
        <QrCode className="h-4 w-4" />
        {t("entranceOnly")}
      </div>

      <h3 className="font-display text-xl text-wine">{guestName}</h3>
      <p className="mt-1 text-sm text-gray-500">{t("invitationId")}: {qrCode}</p>

      <div className="mx-auto my-5 flex min-h-[240px] w-full max-w-[260px] items-center justify-center rounded-xl border border-gold/20 bg-white p-4 shadow-sm">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`${guestName} entrance QR code`}
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
      <p className="mt-2 text-xs text-gray-400">{t("notForGifts")}</p>

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
