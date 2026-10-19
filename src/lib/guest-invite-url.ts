import { coupleInfo } from "@/lib/images";
import { defaultLocale } from "@/i18n/config";

const GUEST_INVITE_KEY = `wedding-guest-invite:${coupleInfo.slug}`;

/** Personal share path — English default has no locale prefix: /EDENAND12R-01 */
export function guestInvitePath(inviteCode: string, locale: string = defaultLocale): string {
  const code = encodeURIComponent(inviteCode.trim().toUpperCase());
  if (!locale || locale === defaultLocale) {
    return `/${code}`;
  }
  return `/${locale}/${code}`;
}

export function guestInviteUrl(inviteCode: string, locale: string = defaultLocale, origin?: string): string {
  const path = guestInvitePath(inviteCode, locale);
  return origin ? `${origin}${path}` : path;
}

export function persistGuestInviteCode(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return;
  sessionStorage.setItem(GUEST_INVITE_KEY, normalized);
}

export function readPersistedGuestInviteCode(): string {
  if (typeof window === "undefined") return "";
  return (sessionStorage.getItem(GUEST_INVITE_KEY) || "").trim().toUpperCase();
}

/** Resolve invite from path /CODE, ?invite=, or session. */
export function resolveGuestInviteCode(pathInviteCode?: string | null): string {
  if (typeof window === "undefined") {
    return (pathInviteCode || "").trim().toUpperCase();
  }

  const fromPath = (pathInviteCode || "").trim().toUpperCase();
  if (fromPath) {
    persistGuestInviteCode(fromPath);
    return fromPath;
  }

  const params = new URLSearchParams(window.location.search);
  const fromQuery = (params.get("invite") || params.get("code") || "").trim().toUpperCase();
  if (fromQuery) {
    persistGuestInviteCode(fromQuery);
    return fromQuery;
  }

  return readPersistedGuestInviteCode();
}
