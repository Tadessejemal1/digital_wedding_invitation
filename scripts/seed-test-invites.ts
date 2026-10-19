import { PrismaClient } from "@prisma/client";
import { ENTRANCE_TICKET_MAX, formatEntranceTicket } from "../src/lib/utils";

const prisma = new PrismaClient();
const slug = process.env.INVITE_SLUG || "ANDINET-EDEN";

async function main() {
  const couple = await prisma.couple.findUnique({ where: { slug } });
  if (!couple) {
    throw new Error(`Couple ${slug} not found — run prisma/seed.ts first`);
  }

  await prisma.guest.deleteMany({ where: { coupleId: couple.id } });

  const tickets = Array.from({ length: ENTRANCE_TICKET_MAX }, (_, i) => {
    const n = i + 1;
    const code = formatEntranceTicket(n);
    return {
      coupleId: couple.id,
      name: `Guest ${String(n).padStart(2, "0")}`,
      inviteCode: code,
      qrCode: code,
      invited: true,
    };
  });

  const chunkSize = 50;
  for (let i = 0; i < tickets.length; i += chunkSize) {
    await prisma.guest.createMany({ data: tickets.slice(i, i + chunkSize) });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  console.log(`Created ${ENTRANCE_TICKET_MAX} entrance tickets`);
  console.log(`Example: ${origin}/${formatEntranceTicket(1)}`);
  console.log(`Last:    ${origin}/${formatEntranceTicket(ENTRANCE_TICKET_MAX)}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
