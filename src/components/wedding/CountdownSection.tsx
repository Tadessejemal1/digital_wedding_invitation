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
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_AM = [
  "ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
  "ጁላይ", "ኦገስት", "ሰፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር",
];

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
    <motion.div className="flex min-w-0 flex-1 flex-col items-center" whileHover={{ scale: 1.05 }}>
      <div className="relative mb-1.5 flex aspect-square w-full max-w-[4.5rem] items-center justify-center rounded-xl border border-gold/30 bg-white shadow-lg sm:mb-2 sm:max-w-[5rem] md:max-w-[7rem]">
        <span className="font-display text-2xl text-wine sm:text-3xl md:text-5xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/70 sm:text-xs md:text-sm">{label}</span>
    </motion.div>
  );
}

function WeddingCalendar({ targetDate }: { targetDate: Date }) {
  const locale = useLocale();
  const t = useTranslations("countdown");
  const isAmharic = locale === "am";

  // UTC parts keep calendar day stable across server/client timezones
  const year = targetDate.getUTCFullYear();
  const month = targetDate.getUTCMonth();
  const weddingDay = targetDate.getUTCDate();

  const monthLabel = isAmharic
    ? `${MONTHS_AM[month]} ${year}`
    : `${MONTHS_EN[month]} ${year}`;

  const weekdays = isAmharic ? AM_WEEKDAYS : EN_WEEKDAYS;

  const cells = useMemo(() => {
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0 = Sunday
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
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
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-lg text-wine sm:text-xl md:text-2xl">{monthLabel}</h3>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold sm:text-xs">
            <Heart className="h-3.5 w-3.5 fill-wine text-wine" strokeWidth={0} />
            {t("ourDay")}
            <Heart className="h-3.5 w-3.5 fill-wine text-wine" strokeWidth={0} />
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
                } ${isWeddingDay ? "text-wine" : "text-wine/80"}`}
                title={isWeddingDay ? t("ourDay") : undefined}
              >
                {isWeddingDay ? (
                  <span className="relative flex h-full w-full items-center justify-center" aria-label={t("ourDay")}>
                    <Heart
                      className="absolute h-[92%] w-[92%] fill-wine text-wine"
                      strokeWidth={0}
                      aria-hidden
                    />
                    <span className="relative z-10 pt-[8%] text-[0.65rem] font-semibold leading-none text-ivory sm:text-xs md:text-sm">
                      {label}
                    </span>
                  </span>
                ) : (
                  label
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

type CountdownState = {
  mode: "countdown" | "today" | "passed";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdownState(targetDate: Date, now = Date.now()): CountdownState {
  const diff = targetDate.getTime() - now;
  const dayMs = 1000 * 60 * 60 * 24;

  if (diff > 0) {
    return {
      mode: "countdown",
      days: Math.floor(diff / dayMs),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  const passedMs = now - targetDate.getTime();
  const daysPassed = Math.floor(passedMs / dayMs);

  if (daysPassed === 0) {
    return { mode: "today", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    mode: "passed",
    days: daysPassed,
    hours: Math.floor((passedMs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((passedMs / (1000 * 60)) % 60),
    seconds: Math.floor((passedMs / 1000) % 60),
  };
}

export function CountdownSection({ targetDate }: CountdownProps) {
  const t = useTranslations("countdown");
  // Start null to avoid SSR/client time mismatch hydration errors
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    const calculate = () => setState(getCountdownState(targetDate));
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const title =
    state?.mode === "passed" || state?.mode === "today" ? t("titlePassed") : t("title");

  return (
    <section className="section-padding bg-wine text-white">
      <SectionHeading title={title} className="[&_h2]:text-white [&_.decorative-line]:via-gold-light" />

      {state?.mode === "today" ? (
        <p className="font-display mx-auto max-w-xl text-center text-2xl text-gold-light sm:text-3xl">
          {t("todayMessage")}
        </p>
      ) : state?.mode === "passed" ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-1">
          <div className="flex w-full justify-center gap-2 sm:gap-4 md:gap-8">
            <TimeUnit value={state.days} label={t("daysPassed")} />
            <TimeUnit value={state.hours} label={t("hours")} />
            <TimeUnit value={state.minutes} label={t("minutes")} />
            <TimeUnit value={state.seconds} label={t("seconds")} />
          </div>
          <p className="font-serif text-center text-base text-white/80 sm:text-lg">
            {t("passedMessage", { days: state.days })}
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-2xl justify-center gap-2 px-1 sm:gap-4 md:gap-8">
          <TimeUnit value={state?.days ?? 0} label={t("days")} />
          <TimeUnit value={state?.hours ?? 0} label={t("hours")} />
          <TimeUnit value={state?.minutes ?? 0} label={t("minutes")} />
          <TimeUnit value={state?.seconds ?? 0} label={t("seconds")} />
        </div>
      )}

      <WeddingCalendar targetDate={targetDate} />
    </section>
  );
}
