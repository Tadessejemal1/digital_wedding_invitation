"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type InviteUnlockContextValue = {
  unlocked: boolean;
  setUnlocked: (value: boolean) => void;
  requirePassword: boolean;
};

const InviteUnlockContext = createContext<InviteUnlockContextValue | null>(null);

export function InviteUnlockProvider({
  requirePassword,
  children,
}: {
  requirePassword: boolean;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(!requirePassword);

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
    <InviteUnlockContext.Provider value={{ unlocked, setUnlocked, requirePassword }}>
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
    };
  }
  return context;
}
