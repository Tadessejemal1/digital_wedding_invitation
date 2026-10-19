import { notFound } from "next/navigation";
import { WeddingHome } from "@/components/wedding/WeddingHome";
import { parseEntranceTicketNumber } from "@/lib/utils";

const RESERVED = new Set([
  "admin",
  "api",
  "invite",
  "ring-program",
  "my-invite",
  "g",
  "favicon.ico",
]);

/** Personal guest link: /EDENAND12R-01 (en default) or /am/EDENAND12R-01 */
export default async function GuestInvitePage({
  params,
}: {
  params: Promise<{ locale: string; inviteCode: string }>;
}) {
  const { locale, inviteCode } = await params;
  const raw = inviteCode.trim();
  const code = raw.toUpperCase();

  if (RESERVED.has(raw.toLowerCase()) || parseEntranceTicketNumber(code) === null) {
    notFound();
  }

  return <WeddingHome locale={locale} inviteCode={code} />;
}
