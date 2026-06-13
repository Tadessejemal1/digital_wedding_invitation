"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMapEmbedUrl } from "@/lib/maps";

interface LocationSectionProps {
  venueName: string;
  venueAddress: string;
  mapLink?: string | null;
  receptionName?: string | null;
  receptionAddress?: string | null;
  receptionMapLink?: string | null;
}

function LocationCard({
  title,
  name,
  address,
  mapLink,
  t,
}: {
  title: string;
  name: string;
  address: string;
  mapLink?: string | null;
  t: ReturnType<typeof useTranslations<"location">>;
}) {
  const embedUrl = getMapEmbedUrl(name, address);

  return (
    <ScrollReveal>
      <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-lg">
        <div className="p-6 text-center">
          <p className="text-sm uppercase tracking-widest text-gold">{title}</p>
          <h3 className="font-display mt-2 text-2xl text-wine">{name}</h3>
          <p className="mt-2 flex items-start gap-2 text-gray-600">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-wine" />
            {address}
          </p>
          {mapLink && (
            <Button variant="outline" className="mt-4" asChild>
              <a href={mapLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {t("openMaps")}
              </a>
            </Button>
          )}
        </div>
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={name}
          />
        </div>
      </div>
    </ScrollReveal>
  );
}

export function LocationSection({
  venueName,
  venueAddress,
  mapLink,
  receptionName,
  receptionAddress,
  receptionMapLink,
}: LocationSectionProps) {
  const t = useTranslations("location");

  return (
    <section id="location" className="section-padding">
      <SectionHeading title={t("title")} />
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <LocationCard
          title={t("ceremony")}
          name={venueName}
          address={venueAddress}
          mapLink={mapLink}
          t={t}
        />
        {receptionName && receptionAddress && (
          <LocationCard
            title={t("reception")}
            name={receptionName}
            address={receptionAddress}
            mapLink={receptionMapLink}
            t={t}
          />
        )}
      </div>
    </section>
  );
}
