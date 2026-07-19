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
  const [soundOn, setSoundOn] = useState(false);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const showControls = !requirePassword || unlocked;

  const playMedia = useCallback(async (preferMutedFallback = true) => {
    const media = mediaRef.current;
    if (!media || isMusicPausedByUser()) return false;

    try {
      media.muted = false;
      media.volume = 1;
      await media.play();
      setPlaying(true);
      setSoundOn(true);
      persistMusicPausedByUser(false);
      return true;
    } catch {
      if (!preferMutedFallback) {
        setPlaying(false);
        return false;
      }

      try {
        // Browsers allow muted autoplay immediately — unmute on first gesture
        media.muted = true;
        await media.play();
        setPlaying(true);
        setSoundOn(false);
        return true;
      } catch {
        setPlaying(false);
        return false;
      }
    }
  }, []);

  const unmuteAndPlay = useCallback(async () => {
    const media = mediaRef.current;
    if (!media || isMusicPausedByUser()) return false;

    media.muted = false;
    media.volume = 1;

    try {
      if (media.paused) await media.play();
      setPlaying(true);
      setSoundOn(true);
      persistMusicPausedByUser(false);
      return true;
    } catch {
      return playMedia(false);
    }
  }, [playMedia]);

  const pauseMedia = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.pause();
    setPlaying(false);
    setSoundOn(false);
    persistMusicPausedByUser(true);
  }, []);

  useEffect(() => {
    registerPlayWeddingMusic(() => {
      void unmuteAndPlay();
    });
    return () => registerPlayWeddingMusic(null);
  }, [registerPlayWeddingMusic, unmuteAndPlay]);

  // Start playback immediately when the invite opens (no delay)
  useEffect(() => {
    if (!shouldAutoPlayMusic(requirePassword, unlocked)) return;

    let cancelled = false;
    const media = mediaRef.current;

    const tryImmediate = () => {
      if (cancelled || isMusicPausedByUser()) return;
      void playMedia(true);
    };

    tryImmediate();

    const onReady = () => tryImmediate();
    media?.addEventListener("loadeddata", onReady);
    media?.addEventListener("canplay", onReady);

    const unlockSound = () => {
      if (cancelled || isMusicPausedByUser()) return;
      void unmuteAndPlay().then((ok) => {
        if (ok) cleanupGestures();
      });
    };

    const cleanupGestures = () => {
      window.removeEventListener("pointerdown", unlockSound, true);
      window.removeEventListener("touchstart", unlockSound, true);
      window.removeEventListener("keydown", unlockSound, true);
      window.removeEventListener("scroll", unlockSound, true);
    };

    // Capture phase so first tap/scroll unlocks sound instantly
    window.addEventListener("pointerdown", unlockSound, true);
    window.addEventListener("touchstart", unlockSound, { capture: true, passive: true });
    window.addEventListener("keydown", unlockSound, true);
    window.addEventListener("scroll", unlockSound, true);

    return () => {
      cancelled = true;
      media?.removeEventListener("loadeddata", onReady);
      media?.removeEventListener("canplay", onReady);
      cleanupGestures();
    };
  }, [unlocked, requirePassword, playMedia, unmuteAndPlay]);

  const toggle = () => {
    if (playing && soundOn) {
      pauseMedia();
    } else {
      void unmuteAndPlay();
    }
  };

  return (
    <>
      <video
        ref={mediaRef}
        loop
        autoPlay
        muted
        playsInline
        preload="auto"
        className="pointer-events-none fixed h-px w-px opacity-0"
        src={MUSIC_SRC}
      />
      {showControls && (
        <motion.button
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggle}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-white/90 text-wine shadow-lg backdrop-blur-sm transition-all hover:bg-gold hover:text-white sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
          aria-label={playing && soundOn ? t("pause") : t("play")}
        >
          <AnimatePresence mode="wait">
            {playing && soundOn ? (
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
