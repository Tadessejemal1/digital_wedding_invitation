"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Pause } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useInviteUnlock } from "@/contexts/InviteUnlockContext";
import {
  persistMusicPausedByUser,
  shouldAutoPlayMusic,
} from "@/lib/invite-unlock";

export function MusicPlayer() {
  const t = useTranslations("music");
  const { unlocked, requirePassword, registerPlayWeddingMusic } = useInviteUnlock();
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const showControls = !requirePassword || unlocked;

  const playMedia = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current
      .play()
      .then(() => {
        setPlaying(true);
        persistMusicPausedByUser(false);
      })
      .catch(() => setPlaying(false));
  }, []);

  const pauseMedia = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.pause();
    setPlaying(false);
    persistMusicPausedByUser(true);
  }, []);

  useEffect(() => {
    registerPlayWeddingMusic(playMedia);
    return () => registerPlayWeddingMusic(null);
  }, [registerPlayWeddingMusic, playMedia]);

  useEffect(() => {
    if (shouldAutoPlayMusic(requirePassword, unlocked)) {
      playMedia();
    }
  }, [unlocked, requirePassword, playMedia]);

  const toggle = () => {
    if (playing) {
      pauseMedia();
    } else {
      playMedia();
    }
  };

  return (
    <>
      <video
        ref={mediaRef}
        loop
        preload="auto"
        playsInline
        className="hidden"
        src="/images/wedding.MP4"
      />
      {showControls && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
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
      )}
    </>
  );
}
