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

const MUSIC_SRC = "/images/weeding.MP4";

export function MusicPlayer() {
  const t = useTranslations("music");
  const { unlocked, requirePassword, registerPlayWeddingMusic } = useInviteUnlock();
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const showControls = !requirePassword || unlocked;

  const playMedia = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return false;

    try {
      media.volume = 1;
      media.muted = false;
      await media.play();
      setPlaying(true);
      persistMusicPausedByUser(false);
      startedRef.current = true;
      return true;
    } catch {
      try {
        // Some browsers only allow muted autoplay first
        media.muted = true;
        await media.play();
        media.muted = false;
        setPlaying(true);
        persistMusicPausedByUser(false);
        startedRef.current = true;
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

  // Start music as soon as the invite link is opened
  useEffect(() => {
    if (!shouldAutoPlayMusic(requirePassword, unlocked)) return;

    let cancelled = false;
    const media = mediaRef.current;

    const tryPlay = () => {
      if (cancelled || isMusicPausedByUser() || startedRef.current) return;
      void playMedia();
    };

    tryPlay();
    const timers = [200, 500, 1200, 2500].map((ms) => window.setTimeout(tryPlay, ms));

    const onReady = () => tryPlay();
    media?.addEventListener("loadeddata", onReady);
    media?.addEventListener("canplay", onReady);

    // Browser autoplay policy: start on first interaction with the page
    const startOnGesture = () => {
      if (cancelled || isMusicPausedByUser()) return;
      void playMedia().then((ok) => {
        if (ok) cleanupGestures();
      });
    };

    const cleanupGestures = () => {
      window.removeEventListener("pointerdown", startOnGesture);
      window.removeEventListener("click", startOnGesture);
      window.removeEventListener("touchstart", startOnGesture);
      window.removeEventListener("keydown", startOnGesture);
    };

    window.addEventListener("pointerdown", startOnGesture);
    window.addEventListener("click", startOnGesture);
    window.addEventListener("touchstart", startOnGesture, { passive: true });
    window.addEventListener("keydown", startOnGesture);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      media?.removeEventListener("loadeddata", onReady);
      media?.removeEventListener("canplay", onReady);
      cleanupGestures();
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
        className="pointer-events-none fixed h-px w-px opacity-0"
        src={MUSIC_SRC}
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
