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
  hasEnteredWithMusic,
  persistEnteredWithMusic,
} from "@/lib/invite-unlock";

const MUSIC_SRC = `/Eden/${encodeURIComponent("Veronica_Adane_Abebaye_ቬሮኒካ_አዳነ_አበባዬ_12.mp3")}`;

export function MusicPlayer() {
  const t = useTranslations("music");
  const { unlocked, requirePassword, registerPlayWeddingMusic } = useInviteUnlock();
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [ready, setReady] = useState(false);
  const mediaRef = useRef<HTMLAudioElement>(null);
  const showControls = !requirePassword || unlocked;

  const playWithSound = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) return false;

    media.muted = false;
    media.volume = 1;

    try {
      await media.play();
      setPlaying(true);
      setSoundOn(true);
      persistMusicPausedByUser(false);
      persistEnteredWithMusic();
      setNeedsTap(false);
      return true;
    } catch {
      setPlaying(false);
      setSoundOn(false);
      return false;
    }
  }, []);

  const pauseMedia = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.pause();
    setPlaying(false);
    setSoundOn(false);
    persistMusicPausedByUser(true);
  }, []);

  useEffect(() => {
    registerPlayWeddingMusic(() => {
      void playWithSound();
    });
    return () => registerPlayWeddingMusic(null);
  }, [registerPlayWeddingMusic, playWithSound]);

  // Try to start with sound immediately; if blocked, show tap-to-open overlay
  useEffect(() => {
    if (!shouldAutoPlayMusic(requirePassword, unlocked)) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const media = mediaRef.current;
    let attempted = false;

    const attempt = async () => {
      if (cancelled || attempted || isMusicPausedByUser()) {
        setReady(true);
        return;
      }
      attempted = true;

      const ok = await playWithSound();
      if (cancelled) return;

      if (!ok) {
        setNeedsTap(true);
        try {
          if (media) {
            media.muted = true;
            await media.play();
            if (!cancelled) {
              setPlaying(true);
              setSoundOn(false);
            }
          }
        } catch {
          // ignore
        }
      }

      if (!cancelled) setReady(true);
    };

    const onCanPlay = () => {
      void attempt();
    };

    media?.addEventListener("canplay", onCanPlay);
    media?.addEventListener("loadeddata", onCanPlay);

    if (media && media.readyState >= 2) {
      void attempt();
    } else {
      // Force load and retry shortly
      try {
        media?.load();
      } catch {
        // ignore
      }
    }

    const timer = window.setTimeout(() => void attempt(), 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      media?.removeEventListener("canplay", onCanPlay);
      media?.removeEventListener("loadeddata", onCanPlay);
    };
  }, [unlocked, requirePassword, playWithSound]);

  // If user already opened this session, keep trying to resume with sound
  useEffect(() => {
    if (!ready || !hasEnteredWithMusic() || isMusicPausedByUser()) return;
    void playWithSound();
  }, [ready, playWithSound]);

  const handleOpenInvite = async () => {
    const ok = await playWithSound();
    if (ok) setNeedsTap(false);
  };

  const toggle = () => {
    if (playing && soundOn) {
      pauseMedia();
    } else {
      void playWithSound();
    }
  };

  return (
    <>
      <audio
        ref={mediaRef}
        loop
        preload="auto"
        className="pointer-events-none fixed h-px w-px opacity-0"
        src={MUSIC_SRC}
      />

      <AnimatePresence>
        {needsTap && showControls && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleOpenInvite}
            className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center bg-wine/95 px-6 text-center text-white"
            aria-label={t("openInvite")}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-sm"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-white/10">
                <Music className="h-7 w-7 text-gold-light" />
              </div>
              <p className="font-display text-3xl text-gold-light sm:text-4xl">{t("openInvite")}</p>
              <p className="font-serif mt-4 text-base italic text-white/80 sm:text-lg">{t("openInviteHint")}</p>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {showControls && !needsTap && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
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
