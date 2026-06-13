"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { persistInviteUnlockState, readInviteUnlockState } from "@/lib/invite-unlock";

type InviteUnlockContextValue = {
  unlocked: boolean;
  setUnlocked: (value: boolean) => void;
  requirePassword: boolean;
  playWeddingMusic: () => void;
  registerPlayWeddingMusic: (fn: (() => void) | null) => void;
};

const InviteUnlockContext = createContext<InviteUnlockContextValue | null>(null);

export function InviteUnlockProvider({
  requirePassword,
  children,
}: {
  requirePassword: boolean;
  children: ReactNode;
}) {
  const [unlocked, setUnlockedState] = useState(() => !requirePassword);
  const playMusicRef = useRef<(() => void) | null>(null);

  const setUnlocked = useCallback((value: boolean) => {
    setUnlockedState(value);
    if (requirePassword) {
      persistInviteUnlockState(value);
    }
  }, [requirePassword]);

  const registerPlayWeddingMusic = useCallback((fn: (() => void) | null) => {
    playMusicRef.current = fn;
  }, []);

  const playWeddingMusic = useCallback(() => {
    playMusicRef.current?.();
  }, []);

  useEffect(() => {
    if (requirePassword && readInviteUnlockState()) {
      setUnlockedState(true);
    }
  }, [requirePassword]);

  useEffect(() => {
    if (requirePassword && !unlocked) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
  }, [requirePassword, unlocked]);

  return (
    <InviteUnlockContext.Provider
      value={{ unlocked, setUnlocked, requirePassword, playWeddingMusic, registerPlayWeddingMusic }}
    >
      {children}
    </InviteUnlockContext.Provider>
  );
}

export function useInviteUnlock() {
  const context = useContext(InviteUnlockContext);
  if (!context) {
    return {
      unlocked: true,
      setUnlocked: () => {},
      requirePassword: false,
      playWeddingMusic: () => {},
      registerPlayWeddingMusic: () => {},
    };
  }
  return context;
}
