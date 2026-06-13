"use client";

import { formatWeddingDate } from "@/lib/utils";
import { GuestQrCard } from "@/components/invite/GuestQrCard";

interface InviteCardProps {
  slug: string;
  groomName: string;
  brideName: string;
  weddingDate: Date;
  guest: {
    id: string;
    name: string;
    qrCode: string;
    status: string;
  } | null;
}

export function InviteCard({ slug, groomName, brideName, weddingDate, guest }: InviteCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory to-background p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gold/30 bg-white shadow-2xl">
        <div className="gold-gradient p-8 text-center text-white">
          <p className="text-sm uppercase tracking-widest opacity-80">Digital Invitation</p>
          <h1 className="font-display mt-2 text-3xl">
            {groomName} & {brideName}
          </h1>
          <p className="mt-2 font-serif italic opacity-90">
            {formatWeddingDate(weddingDate, "en")}
          </p>
        </div>

        {guest ? (
          <GuestQrCard
            guestName={guest.name}
            guestId={guest.id}
            qrCode={guest.qrCode}
            status={guest.status}
            inviteUrl={`/invite/${slug}?guest=${guest.id}`}
          />
        ) : (
          <div className="p-8 text-center">
            <p className="font-serif text-gray-600">
              Welcome to the wedding of {groomName} & {brideName}
            </p>
            <a
              href={`/en?ref=${slug}`}
              className="mt-6 inline-block rounded-lg bg-wine px-6 py-3 text-white hover:bg-wine-light"
            >
              View Full Invitation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
