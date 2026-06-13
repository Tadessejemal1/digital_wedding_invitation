"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

interface ProgramItem {
  id: string;
  title: string;
  startTime: string;
  description?: string | null;
}

interface ProgramSectionProps {
  items: ProgramItem[];
}

export function ProgramSection({ items }: ProgramSectionProps) {
  const t = useTranslations("program");

  return (
    <section id="program" className="section-padding">
      <SectionHeading title={t("title")} />
      <div className="relative mx-auto max-w-3xl px-2 sm:px-4">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gold/30" />
        {items.map((item, index) => {
          const isLeft = index % 2 === 0;

          return (
            <ScrollReveal key={item.id} delay={index * 0.1}>
              <div className="relative mb-8 flex items-start">
                <div className={`w-[calc(50%-0.75rem)] ${isLeft ? "pr-3 sm:pr-4" : ""}`}>
                  {isLeft && (
                    <div className="rounded-xl border border-gold/20 bg-white p-4 shadow-md sm:p-6">
                      <time className="font-display text-base text-gold sm:text-lg">{item.startTime}</time>
                      <h3 className="font-display mt-1 text-lg text-wine sm:text-xl">{item.title}</h3>
                      {item.description && (
                        <p className="mt-2 font-serif text-sm text-gray-600 sm:text-base">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute left-1/2 top-3 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 border-gold bg-white">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                </div>

                <div className={`w-[calc(50%-0.75rem)] ${!isLeft ? "pl-3 sm:pl-4" : ""}`}>
                  {!isLeft && (
                    <div className="rounded-xl border border-gold/20 bg-white p-4 shadow-md sm:p-6">
                      <time className="font-display text-base text-gold sm:text-lg">{item.startTime}</time>
                      <h3 className="font-display mt-1 text-lg text-wine sm:text-xl">{item.title}</h3>
                      {item.description && (
                        <p className="mt-2 font-serif text-sm text-gray-600 sm:text-base">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
