"use client";

import type { ReactNode } from "react";
import { InviteUnlockProvider, useInviteUnlock } from "@/contexts/InviteUnlockContext";
import { Navigation } from "@/components/wedding/Navigation";
import { FloatingFlowers } from "@/components/shared/FloatingFlowers";
import { MusicPlayer } from "@/components/shared/MusicPlayer";

function WeddingChrome() {
  const { unlocked, requirePassword } = useInviteUnlock();
  const showChrome = !requirePassword || unlocked;

  return (
    <>
      <MusicPlayer />
      {showChrome && (
        <>
          <FloatingFlowers />
          <Navigation />
        </>
      )}
    </>
  );
}

function LockedContent({ children }: { children: ReactNode }) {
  const { unlocked, requirePassword } = useInviteUnlock();

  if (requirePassword && !unlocked) return null;

  return <>{children}</>;
}

export function WeddingPageShell({
  requirePassword,
  hero,
  children,
}: {
  requirePassword: boolean;
  hero: ReactNode;
  children: ReactNode;
}) {
  return (
    <InviteUnlockProvider requirePassword={requirePassword}>
      <WeddingChrome />
      <main>
        {hero}
        <LockedContent>{children}</LockedContent>
      </main>
    </InviteUnlockProvider>
  );
}
