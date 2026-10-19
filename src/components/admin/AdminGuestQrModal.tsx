"use client";

import { useEffect, useState } from "react";
import { generateQrDataUrl, getGuestQrPayload } from "@/lib/qr";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download, X } from "lucide-react";

interface AdminGuestQrModalProps {
  guest: {
    id: string;
    name: string;
    inviteCode: string;
    qrCode: string;
    status: string;
  };
  onClose: () => void;
}

/** Admin helper: download entrance QR to send, or copy full-site personal link. */
export function AdminGuestQrModal({ guest, onClose }: AdminGuestQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const personalLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/${encodeURIComponent(guest.inviteCode)}`
      : `/${guest.inviteCode}`;

  useEffect(() => {
    let cancelled = false;
    const payload = getGuestQrPayload(guest.id, guest.qrCode);
    generateQrDataUrl(payload).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [guest.id, guest.qrCode]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(personalLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `entrance-qr-${guest.inviteCode}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-wine"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="font-display text-center text-xl text-wine">{guest.inviteCode}</p>
        <p className="mt-2 rounded-lg bg-wine/5 px-3 py-2 text-center text-xs leading-relaxed text-wine">
          Send this <strong>entrance QR</strong> (WhatsApp / Telegram). Whoever has it can enter once
          at the door. Optional: send the site link so they can open the pass on the wedding website.
        </p>

        <div className="mx-auto my-5 flex h-[200px] w-[200px] items-center justify-center rounded-xl border border-gold/20 bg-white p-3">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={`${guest.inviteCode} entrance QR`} width={180} height={180} />
          ) : (
            <div className="h-[180px] w-[180px] animate-pulse rounded-lg bg-ivory" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={downloadQr} disabled={!qrDataUrl} className="w-full">
            <Download className="mr-2 h-4 w-4" /> Download entrance QR
          </Button>
          <Button type="button" variant="outline" onClick={copyLink} className="w-full">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Link copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copy full-site Entrance Card link
              </>
            )}
          </Button>
          <p className="break-all text-center font-mono text-[10px] text-gray-400">{personalLink}</p>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full">
            Done / Next guest
          </Button>
        </div>
      </div>
    </div>
  );
}
