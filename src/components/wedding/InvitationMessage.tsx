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
          <blockquote className="relative px-8 text-center">
            <span className="font-display absolute -left-2 -top-4 text-6xl text-gold/30">&ldquo;</span>
            <p className="font-serif text-xl leading-relaxed italic text-gray-700 md:text-2xl">
              {message}
            </p>
            <span className="font-display absolute -bottom-8 -right-2 text-6xl text-gold/30">&rdquo;</span>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}
