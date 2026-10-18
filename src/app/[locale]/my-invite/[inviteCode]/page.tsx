"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";

/** Old personal links redirect onto the full wedding site + Entrance Card. */
export default function MyInviteRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = String(params.inviteCode || "").trim().toUpperCase();

  useEffect(() => {
    if (!inviteCode) {
      router.replace("/");
      return;
    }
    router.replace(`/?invite=${encodeURIComponent(inviteCode)}#check-in`);
  }, [inviteCode, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <p className="text-sm text-gray-500">Opening your invitation…</p>
    </div>
  );
}
