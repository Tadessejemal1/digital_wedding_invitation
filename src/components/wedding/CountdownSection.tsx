"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";

interface CountdownProps {
  targetDate: Date;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-xl border border-gold/30 bg-white shadow-lg md:h-28 md:w-28">
        <span className="font-display text-3xl text-wine md:text-5xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs uppercase tracking-widest text-gray-500 md:text-sm">{label}</span>
    </motion.div>
  );
}

export function CountdownSection({ targetDate }: CountdownProps) {
  const t = useTranslations("countdown");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="section-padding bg-wine text-white">
      <SectionHeading title={t("title")} className="[&_h2]:text-white [&_.decorative-line]:via-gold-light" />
      <div className="mx-auto flex max-w-2xl justify-center gap-4 md:gap-8">
        <TimeUnit value={timeLeft.days} label={t("days")} />
        <TimeUnit value={timeLeft.hours} label={t("hours")} />
        <TimeUnit value={timeLeft.minutes} label={t("minutes")} />
        <TimeUnit value={timeLeft.seconds} label={t("seconds")} />
      </div>
    </section>
  );
}
