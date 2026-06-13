import { coupleInfo } from "@/lib/images";

const UNLOCK_STORAGE_KEY = `wedding-unlocked:${coupleInfo.slug}`;
const MUSIC_PAUSED_KEY = `wedding-music-paused:${coupleInfo.slug}`;

export function readInviteUnlockState(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(UNLOCK_STORAGE_KEY) === "true";
}

export function persistInviteUnlockState(unlocked: boolean): void {
  if (typeof window === "undefined") return;
  if (unlocked) {
    sessionStorage.setItem(UNLOCK_STORAGE_KEY, "true");
    sessionStorage.removeItem(MUSIC_PAUSED_KEY);
  } else {
    sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    sessionStorage.removeItem(MUSIC_PAUSED_KEY);
  }
}

export function isMusicPausedByUser(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(MUSIC_PAUSED_KEY) === "true";
}

export function persistMusicPausedByUser(paused: boolean): void {
  if (typeof window === "undefined") return;
  if (paused) {
    sessionStorage.setItem(MUSIC_PAUSED_KEY, "true");
  } else {
    sessionStorage.removeItem(MUSIC_PAUSED_KEY);
  }
}

export function shouldAutoPlayMusic(requirePassword: boolean, unlocked: boolean): boolean {
  if (requirePassword && !unlocked) return false;
  return !isMusicPausedByUser();
}
