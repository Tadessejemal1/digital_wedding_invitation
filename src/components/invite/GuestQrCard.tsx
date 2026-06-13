"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    const payload = getGuestQrPayload(guestId, qrCode);
    generateQrDataUrl(payload).then(setQrDataUrl);
  }, [guestId, qrCode]);

  return (
    <div className={`rounded-2xl border border-gold/30 bg-white text-center shadow-lg ${compact ? "p-6" : "p-8"}`}>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-wine/10 px-4 py-2 text-sm text-wine">
        <QrCode className="h-4 w-4" />
        {t("entranceOnly")}
      </div>

      <h3 className="font-display text-xl text-wine">{guestName}</h3>
      <p className="mt-1 text-sm text-gray-500">{t("invitationId")}: {qrCode}</p>

      {qrDataUrl && (
        <div className="mx-auto my-6 w-52 rounded-xl border border-gold/20 bg-ivory p-3">
          <Image
            src={qrDataUrl}
            alt={`${guestName} entrance QR code`}
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>
      )}

      <p className="font-serif text-sm text-gray-600">{t("scanAtEntrance")}</p>
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
