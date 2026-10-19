import prisma from "@/lib/prisma";
import {
  ENTRANCE_TICKET_MAX,
  ENTRANCE_TICKET_PREFIX,
  formatEntranceTicket,
  parseEntranceTicketNumber,
} from "@/lib/utils";

/** Next free ticket number for a couple (1–350). */
export async function allocateEntranceTicket(
  coupleId: string
): Promise<{ inviteCode: string; qrCode: string; number: number }> {
  const existing = await prisma.guest.findMany({
    where: {
      coupleId,
      inviteCode: { startsWith: `${ENTRANCE_TICKET_PREFIX}-` },
    },
    select: { inviteCode: true },
  });

  const used = new Set(
    existing
      .map((g) => parseEntranceTicketNumber(g.inviteCode))
      .filter((n): n is number => n !== null)
  );

  for (let n = 1; n <= ENTRANCE_TICKET_MAX; n++) {
    if (!used.has(n)) {
      const code = formatEntranceTicket(n);
      return { inviteCode: code, qrCode: code, number: n };
    }
  }

  throw new Error(`All ${ENTRANCE_TICKET_MAX} entrance tickets are already issued`);
}
