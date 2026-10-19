import { notFound } from "next/navigation";
import { WeddingHome } from "@/components/wedding/WeddingHome";
import { parseEntranceTicketNumber } from "@/lib/utils";

/** Personal guest link: /EDENAND12R-01 (en default) or /am/EDENAND12R-01 */
export default async function GuestInvitePage({
  params,
}: {
  params: Promise<{ locale: string; inviteCode: string }>;
}) {
  const { locale, inviteCode } = await params;
  const code = inviteCode.trim().toUpperCase();

  // Only treat entrance ticket codes as guest pages (avoids catching other paths)
  if (parseEntranceTicketNumber(code) === null) {
    notFound();
  }

  return <WeddingHome locale={locale} inviteCode={code} />;
}
