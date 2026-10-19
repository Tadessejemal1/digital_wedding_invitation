import { PrismaClient } from "@prisma/client";
import { ENTRANCE_TICKET_MAX, formatEntranceTicket } from "../src/lib/utils";

const prisma = new PrismaClient();
const slug = process.env.INVITE_SLUG || "ANDINET-EDEN";

async function main() {
  const couple = await prisma.couple.findUnique({ where: { slug } });
  if (!couple) throw new Error(`Couple not found: ${slug}`);

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

  for (let i = 0; i < tickets.length; i += 50) {
    await prisma.guest.createMany({ data: tickets.slice(i, i + 50) });
  }

  const count = await prisma.guest.count({ where: { coupleId: couple.id } });
  console.log(`Inserted ${count} tickets: ${formatEntranceTicket(1)} … ${formatEntranceTicket(ENTRANCE_TICKET_MAX)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
