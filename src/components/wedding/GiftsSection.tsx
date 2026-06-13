"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { CreditCard, Gift, Smartphone, Info } from "lucide-react";

interface GiftsSectionProps {
  cbeAccount?: string | null;
  telebirr?: string | null;
  giftRegistry?: string | null;
}

export function GiftsSection({ cbeAccount, telebirr, giftRegistry }: GiftsSectionProps) {
  const t = useTranslations("gifts");

  if (!cbeAccount && !telebirr && !giftRegistry) return null;

  const items = [
    { icon: CreditCard, label: t("cbe"), value: cbeAccount },
    { icon: Smartphone, label: t("telebirr"), value: telebirr },
    { icon: Gift, label: t("registry"), value: giftRegistry, isLink: true },
  ].filter((i) => i.value);

  return (
    <section id="gifts" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <ScrollReveal>
        <div className="mx-auto mb-8 flex max-w-3xl items-start gap-3 rounded-xl border border-gold/30 bg-white p-4 text-sm text-gray-600">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p>{t("notice")}</p>
        </div>
      </ScrollReveal>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <ScrollReveal key={item.label} delay={i * 0.1}>
            <div className="rounded-2xl border border-gold/20 bg-white p-6 text-center shadow-md">
              <item.icon className="mx-auto mb-4 h-8 w-8 text-gold" />
              <h3 className="font-display text-sm uppercase tracking-widest text-wine">{item.label}</h3>
              {item.isLink ? (
                <a href={item.value!} target="_blank" rel="noopener noreferrer" className="mt-2 block font-serif text-gold hover:underline">
                  {t("viewRegistry")}
                </a>
              ) : (
                <p className="mt-2 font-mono text-lg">{item.value}</p>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
