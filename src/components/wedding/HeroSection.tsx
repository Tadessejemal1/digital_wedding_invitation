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
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={"/images/M13.jpeg"}
          alt="Wedding"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
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
          className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-gold/30 bg-white/95 p-8 shadow-2xl backdrop-blur-md"
        >
          <h2 className="font-display mb-6 text-center text-2xl text-wine">
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
        <div className="relative z-10 px-4 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-serif mb-4 text-lg italic md:text-xl"
          >
            {t("together")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-display mb-6 text-5xl font-light tracking-wider md:text-7xl lg:text-8xl"
          >
            <span className="shimmer-text">{groomName}</span>
            <span className="mx-4 text-gold-light">&</span>
            <span className="shimmer-text">{brideName}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="font-serif mx-auto mb-8 max-w-lg text-lg italic md:text-xl"
          >
            {t("invite")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="font-display text-2xl tracking-wide text-gold-light md:text-3xl"
          >
            {formatWeddingDate(weddingDate, locale)}
          </motion.div>
        </div>
      )}

      {!isLocked && (
        <motion.a
          href="#story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/80"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </motion.a>
      )}
    </section>
  );
}
