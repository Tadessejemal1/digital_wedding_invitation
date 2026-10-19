"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { persistGuestInviteCode } from "@/lib/guest-invite-url";

/**
 * If someone opens an old ?invite=CODE link on the public home page,
 * move them onto /CODE (hero start — no #check-in).
 */
export function GuestInvitePathSync() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get("invite") || params.get("code") || "").trim().toUpperCase();
    if (!code) return;

    const path = window.location.pathname;
    // Already on /CODE, /am/CODE, /en/CODE, or legacy /g/CODE
    if (/(^|\/)(g\/)?EDENAND12R-\d+\/?$/i.test(path)) return;

    persistGuestInviteCode(code);
    router.replace(`/${encodeURIComponent(code)}`);
  }, [router]);

  return null;
}
