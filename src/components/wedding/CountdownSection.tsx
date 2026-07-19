"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { weddingImages } from "@/lib/images";

interface CountdownProps {
  targetDate: Date;
}

const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const AM_WEEKDAYS = ["እሁድ", "ሰኞ", "ማክሰ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];

const ETHIOPIC_ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
const ETHIOPIC_TENS = ["", "፲", "፳", "፴"];

function toEthiopicNumeral(n: number): string {
  if (n <= 0) return String(n);
  if (n < 10) return ETHIOPIC_ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${ETHIOPIC_TENS[tens] || ""}${ones ? ETHIOPIC_ONES[ones] : ""}`;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.05 }}>
      <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-xl border border-gold/30 bg-white shadow-lg md:h-28 md:w-28">
        <span className="font-display text-3xl text-wine md:text-5xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs uppercase tracking-widest text-white/70 md:text-sm">{label}</span>
    </motion.div>
  );
}

function WeddingCalendar({ targetDate }: { targetDate: Date }) {
  const locale = useLocale();
  const t = useTranslations("countdown");
  const isAmharic = locale === "am";

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const weddingDay = targetDate.getDate();

  const monthLabel = useMemo(() => {
    return targetDate.toLocaleDateString(isAmharic ? "am-ET" : "en-US", {
      month: "long",
      year: "numeric",
    });
  }, [targetDate, isAmharic]);

  const weekdays = isAmharic ? AM_WEEKDAYS : EN_WEEKDAYS;

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto mt-12 w-full max-w-md overflow-hidden rounded-2xl border border-gold/30 bg-ivory shadow-2xl"
    >
      <div className="absolute inset-0">
        <Image
          src={weddingImages.hero}
          alt=""
          fill
          className="object-cover object-center opacity-[0.18]"
          sizes="400px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/90 via-ivory/75 to-ivory/90" />
      </div>

      <div className="relative z-10 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-wine sm:text-2xl">{monthLabel}</h3>
          <span className="flex items-center gap-1 text-xs uppercase tracking-widest text-gold">
            <Heart className="h-3.5 w-3.5 fill-wine text-wine" />
            {t("ourDay")}
          </span>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {weekdays.map((day) => (
            <div
              key={day}
              className={`py-1 text-[10px] font-medium text-wine/60 sm:text-xs ${isAmharic ? "font-amharic" : ""}`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isWeddingDay = day === weddingDay;
            const label = isAmharic ? toEthiopicNumeral(day) : String(day);

            return (
              <div
                key={day}
                className={`relative flex aspect-square items-center justify-center rounded-lg text-sm sm:text-base ${
                  isAmharic ? "font-amharic" : "font-display"
                } ${
                  isWeddingDay
                    ? "bg-wine text-white shadow-md ring-2 ring-gold"
                    : "text-wine/80"
                }`}
              >
                {isWeddingDay && (
                  <Heart className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 fill-gold text-gold" />
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>
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

      <WeddingCalendar targetDate={targetDate} />
    </section>
  );
}
