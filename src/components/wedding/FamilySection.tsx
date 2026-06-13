"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Heart } from "lucide-react";

interface FamilySectionProps {
  brideFamily?: string | null;
  groomFamily?: string | null;
}

export function FamilySection({ brideFamily, groomFamily }: FamilySectionProps) {
  const t = useTranslations("family");

  if (!brideFamily && !groomFamily) return null;

  return (
    <section className="section-padding bg-ivory">
      <SectionHeading title={t("title")} />
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {brideFamily && (
          <ScrollReveal>
            <div className="rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-md">
              <Heart className="mx-auto mb-4 h-8 w-8 text-wine" />
              <h3 className="font-display mb-4 text-xl text-wine">{t("brideFamily")}</h3>
              <p className="font-serif text-lg leading-relaxed text-gray-700 whitespace-pre-line">
                {brideFamily}
              </p>
            </div>
          </ScrollReveal>
        )}
        {groomFamily && (
          <ScrollReveal delay={0.2}>
            <div className="rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-md">
              <Heart className="mx-auto mb-4 h-8 w-8 text-wine" />
              <h3 className="font-display mb-4 text-xl text-wine">{t("groomFamily")}</h3>
              <p className="font-serif text-lg leading-relaxed text-gray-700 whitespace-pre-line">
                {groomFamily}
              </p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
