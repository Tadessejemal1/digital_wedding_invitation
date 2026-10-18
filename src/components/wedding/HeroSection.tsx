"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useInviteUnlock } from "@/contexts/InviteUnlockContext";
import { formatWeddingDate } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface HeroProps {
  groomName: string;
  brideName: string;
  weddingDate: Date;
  coverImage?: string | null;
  requirePassword?: boolean;
  onUnlock?: () => void;
}

export function HeroSection({
  groomName,
  brideName,
  weddingDate,
  coverImage,
  requirePassword = false,
  onUnlock,
}: HeroProps) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const { unlocked, setUnlocked, requirePassword: gateRequired, playWeddingMusic } = useInviteUnlock();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const isLocked = (requirePassword || gateRequired) && !unlocked;
  const dateLabel =
    locale === "am"
      ? "እሁድ ጥቅምት 22 ቀን 2019 ዓ.ም."
      : formatWeddingDate(weddingDate, locale);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/invite/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      playWeddingMusic();
      setUnlocked(true);
      onUnlock?.();
    } else {
      setError(true);
    }
  };

  return (
    <section
      id="home"
      className={`relative flex min-h-screen flex-col items-center overflow-hidden pb-8 ${
        isLocked ? "justify-center" : "justify-end"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Matching soft background (fills edges when zoomed out) */}
        <Image
          src={coverImage || "/images/0K8A0230.JPG"}
          alt=""
          fill
          priority
          aria-hidden
          className="object-cover object-center brightness-110"
          sizes="100vw"
          style={{ filter: "blur(28px)", transform: "scale(1.2)" }}
        />
        {/* Main photo — wider scale, slightly raised above invite text */}
        <Image
          src={coverImage || "/images/0K8A0230.JPG"}
          alt={`${groomName} & ${brideName}`}
          fill
          priority
          quality={90}
          className="object-contain object-[center_18%] brightness-105"
          sizes="100vw"
          style={{ transform: "scale(1.28) translateY(-3%)" }}
        />
        {/* Soft bottom fade for text readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
      </div>

      {isLocked && (
        <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
          <LanguageSwitcher />
        </div>
      )}

      {isLocked ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-3 w-full max-w-md rounded-2xl border border-gold/30 bg-white/95 p-5 shadow-2xl backdrop-blur-md sm:mx-4 sm:p-8"
        >
          <h2 className="font-display mb-6 text-center text-xl text-wine sm:text-2xl">
            {groomName} & {brideName}
          </h2>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              placeholder={t("enterCode")}
              className="w-full rounded-lg border border-gold/30 bg-white px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {error && (
              <p className="text-center text-sm text-red-600">{t("wrongCode")}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-wine py-3 font-medium text-white transition-colors hover:bg-wine-light"
            >
              {t("unlock")}
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="relative z-10 mb-14 w-full px-3 text-center text-white sm:mb-16 sm:px-4 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-serif mb-2 text-base italic text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:mb-3 sm:text-lg md:text-xl"
          >
            {t("together")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-display mb-3 flex flex-col items-center gap-1 text-3xl font-light tracking-wide drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)] sm:mb-4 sm:gap-0 sm:text-5xl sm:tracking-wider md:flex-row md:justify-center md:text-7xl lg:text-8xl"
          >
            <span className="shimmer-text">{groomName}</span>
            <span className="mx-0 text-2xl text-gold-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:mx-3 sm:text-[0.85em] md:mx-4">&</span>
            <span className="shimmer-text">{brideName}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="font-serif mx-auto mb-4 max-w-lg px-1 text-base italic text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:mb-5 sm:text-lg md:text-xl"
          >
            {t("invite")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="font-display text-lg tracking-wide text-gold-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-2xl md:text-3xl"
          >
            {dateLabel}
          </motion.div>
        </div>
      )}

      {!isLocked && (
        <motion.a
          href="#story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-white/90 drop-shadow-lg sm:bottom-8"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </motion.a>
      )}
    </section>
  );
}
