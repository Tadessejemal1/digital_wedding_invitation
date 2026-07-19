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
}

export function LocationSection({
  venueName,
  venueAddress,
  mapLink,
}: LocationSectionProps) {
  const t = useTranslations("location");
  const embedUrl = getMapEmbedUrl(venueName, venueAddress, mapLink);

  return (
    <section id="location" className="section-padding">
      <SectionHeading title={t("title")} />
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-lg">
            <div className="p-6 text-center">
              <p className="text-sm uppercase tracking-widest text-gold">{t("ceremony")}</p>
              <h3 className="font-display mt-2 text-2xl text-wine">{venueName}</h3>
              <p className="mt-2 flex items-start justify-center gap-2 text-gray-600">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-wine" />
                {venueAddress}
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
                title={venueName}
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
