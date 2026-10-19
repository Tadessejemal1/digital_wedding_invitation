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

function CouplePortrait({
  image,
  name,
  role,
  bio,
}: {
  image: string;
  name: string;
  role: string;
  bio?: string | null;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-xl">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f3efe6]">
        <Image
          src={image}
          alt={name}
          fill
          quality={95}
          priority
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="bg-gradient-to-b from-wine to-wine/95 px-4 py-5 text-center text-white sm:px-6">
        <p className="text-sm uppercase tracking-widest text-gold-light">{role}</p>
        <h3 className="font-display mt-1 text-2xl sm:text-3xl">{name}</h3>
        {bio && <p className="mt-2 font-serif text-sm italic text-white/90">{bio}</p>}
      </div>
    </div>
  );
}

export function StorySection({
  groomName,
  brideName,
  brideImage = "/Eden/DSC05039-Recovered.jpg",
  groomImage = "/Eden/DSC04900-Recovered.jpg",
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

      <div className="mx-auto grid max-w-5xl items-stretch gap-8 md:grid-cols-2 md:gap-10">
        <ScrollReveal className="h-full">
          <CouplePortrait
            image={brideImage}
            name={brideName}
            role={t("bride")}
            bio={brideBio}
          />
        </ScrollReveal>

        <ScrollReveal className="h-full" delay={0.2}>
          <CouplePortrait
            image={groomImage}
            name={groomName}
            role={t("groom")}
            bio={groomBio}
          />
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
