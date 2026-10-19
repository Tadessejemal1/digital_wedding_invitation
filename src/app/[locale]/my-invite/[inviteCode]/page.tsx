"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { persistGuestInviteCode } from "@/lib/guest-invite-url";

/** Legacy /my-invite/CODE → personal /CODE (keeps guest context). */
export default function MyInviteRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = String(params.inviteCode || "").trim().toUpperCase();

  useEffect(() => {
    if (!inviteCode) {
      router.replace("/");
      return;
    }
    persistGuestInviteCode(inviteCode);
    router.replace(`/${encodeURIComponent(inviteCode)}`);
  }, [inviteCode, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <p className="text-sm text-gray-500">Opening your invitation…</p>
    </div>
  );
}
