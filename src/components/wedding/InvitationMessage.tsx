"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

interface InvitationMessageProps {
  message?: string | null;
}

export function InvitationMessage({ message }: InvitationMessageProps) {
  const t = useTranslations("invitation");

  if (!message) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-ivory via-white to-ivory" />
      <div className="relative mx-auto max-w-3xl">
        <SectionHeading title={t("title")} />
        <ScrollReveal>
          <blockquote className="relative px-4 text-center sm:px-8">
            <span className="font-display absolute left-0 top-0 text-4xl text-gold/30 sm:-left-2 sm:-top-4 sm:text-6xl">&ldquo;</span>
            <p className="font-serif text-lg leading-relaxed italic text-gray-700 sm:text-xl md:text-2xl">
              {message}
            </p>
            <span className="font-display absolute bottom-0 right-0 text-4xl text-gold/30 sm:-bottom-8 sm:-right-2 sm:text-6xl">&rdquo;</span>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}
