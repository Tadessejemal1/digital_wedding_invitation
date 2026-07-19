"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Pause } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useInviteUnlock } from "@/contexts/InviteUnlockContext";
import {
  persistMusicPausedByUser,
  shouldAutoPlayMusic,
  isMusicPausedByUser,
} from "@/lib/invite-unlock";

export function MusicPlayer() {
  const t = useTranslations("music");
  const { unlocked, requirePassword, registerPlayWeddingMusic } = useInviteUnlock();
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const showControls = !requirePassword || unlocked;

  const playMedia = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return false;

    try {
      media.muted = false;
      await media.play();
      setPlaying(true);
      persistMusicPausedByUser(false);
      return true;
    } catch {
      // Browsers often block unmuted autoplay — try muted, then unmute
      try {
        media.muted = true;
        await media.play();
        media.muted = false;
        setPlaying(true);
        persistMusicPausedByUser(false);
        return true;
      } catch {
        setPlaying(false);
        return false;
      }
    }
  }, []);

  const pauseMedia = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.pause();
    setPlaying(false);
    persistMusicPausedByUser(true);
  }, []);

  useEffect(() => {
    registerPlayWeddingMusic(() => {
      void playMedia();
    });
    return () => registerPlayWeddingMusic(null);
  }, [registerPlayWeddingMusic, playMedia]);

  // Auto-start when the invite page opens
  useEffect(() => {
    if (!shouldAutoPlayMusic(requirePassword, unlocked)) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || isMusicPausedByUser()) return;
      void playMedia();
    };

    // Immediate + short delayed retries (media may not be ready yet)
    tryPlay();
    const t1 = window.setTimeout(tryPlay, 300);
    const t2 = window.setTimeout(tryPlay, 1000);

    // If autoplay is blocked, start on first tap/click/keydown
    const startOnGesture = () => {
      if (cancelled || isMusicPausedByUser()) return;
      void playMedia().then((ok) => {
        if (ok) {
          window.removeEventListener("pointerdown", startOnGesture);
          window.removeEventListener("keydown", startOnGesture);
          window.removeEventListener("touchstart", startOnGesture);
        }
      });
    };

    window.addEventListener("pointerdown", startOnGesture, { once: false });
    window.addEventListener("keydown", startOnGesture, { once: false });
    window.addEventListener("touchstart", startOnGesture, { once: false });

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("pointerdown", startOnGesture);
      window.removeEventListener("keydown", startOnGesture);
      window.removeEventListener("touchstart", startOnGesture);
    };
  }, [unlocked, requirePassword, playMedia]);

  const toggle = () => {
    if (playing) {
      pauseMedia();
    } else {
      void playMedia();
    }
  };

  return (
    <>
      <video
        ref={mediaRef}
        loop
        autoPlay
        playsInline
        preload="auto"
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
