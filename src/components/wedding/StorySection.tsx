"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

interface StoryProps {
  groomName: string;
  brideName: string;
  brideImage?: string;
  groomImage?: string;
  groomBio?: string | null;
  brideBio?: string | null;
  howTheyMet?: string | null;
  journey?: string | null;
  story?: string | null;
}

export function StorySection({
  groomName,
  brideName,
  brideImage = "/images/M9.jpeg",
  groomImage = "/images/M11.jpeg",
  groomBio,
  brideBio,
  howTheyMet,
  journey,
  story,
}: StoryProps) {
  const t = useTranslations("story");

  return (
    <section id="story" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} />

      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <ScrollReveal>
          <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={brideImage}
              alt={brideName}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine/60 to-transparent" />
            <div className="absolute bottom-0 p-6 text-center text-white">
              <p className="text-sm uppercase tracking-widest text-gold-light">{t("bride")}</p>
              <h3 className="font-display text-3xl">{brideName}</h3>
              {brideBio && <p className="mt-2 font-serif italic opacity-90">{brideBio}</p>}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={groomImage}
              alt={groomName}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine/60 to-transparent" />
            <div className="absolute bottom-0 p-6 text-center text-white">
              <p className="text-sm uppercase tracking-widest text-gold-light">{t("groom")}</p>
              <h3 className="font-display text-3xl">{groomName}</h3>
              {groomBio && <p className="mt-2 font-serif italic opacity-90">{groomBio}</p>}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="mx-auto mt-16 max-w-3xl space-y-12">
        {howTheyMet && (
          <ScrollReveal>
            <h3 className="font-display mb-4 text-center text-2xl text-wine">{t("howWeMet")}</h3>
            <p className="font-serif whitespace-pre-line text-center text-lg leading-relaxed text-gray-700">{howTheyMet}</p>
          </ScrollReveal>
        )}
        {journey && (
          <ScrollReveal delay={0.1}>
            <h3 className="font-display mb-4 text-center text-2xl text-wine">{t("ourJourney")}</h3>
            <p className="font-serif whitespace-pre-line text-center text-lg leading-relaxed text-gray-700">{journey}</p>
          </ScrollReveal>
        )}
        {story && !howTheyMet && !journey && (
          <ScrollReveal>
            <p className="font-serif text-center text-lg leading-relaxed text-gray-700">{story}</p>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
