"use client";

import { useState, useRef } from "react";
import { Music, Pause } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export function MusicPlayer() {
  const t = useTranslations("music");
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    if (!mediaRef.current) return;
    if (playing) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <>
      <video
        ref={mediaRef}
        loop
        preload="none"
        playsInline
        className="hidden"
        src="/images/wedding.MP4"
      />
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-white/90 text-wine shadow-lg backdrop-blur-sm transition-all hover:bg-gold hover:text-white"
        aria-label={playing ? t("pause") : t("play")}
      >
        <AnimatePresence mode="wait">
          {playing ? (
            <motion.span key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Pause className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="play" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Music className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
