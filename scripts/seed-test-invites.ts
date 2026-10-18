import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slug = process.env.INVITE_SLUG || "ANDINET-EDEN";

const guests = [
  { name: "Test Guest One", inviteCode: "EDEN-TEST1", qrCode: "TESTQR01", invited: true },
  { name: "Test Guest Two", inviteCode: "EDEN-TEST2", qrCode: "TESTQR02", invited: true },
  { name: "Test Guest Three", inviteCode: "EDEN-TEST3", qrCode: "TESTQR03", invited: true },
];

async function main() {
  const couple = await prisma.couple.findUnique({ where: { slug } });
  if (!couple) {
    console.error("No couple for", slug);
    process.exit(1);
  }

  for (const g of guests) {
    await prisma.guest.upsert({
      where: { inviteCode: g.inviteCode },
      update: { name: g.name, invited: true, qrCode: g.qrCode },
      create: { coupleId: couple.id, ...g },
    });
  }

  const origin = "http://localhost:3000";
  console.log("Full-site Entrance Card links to test:\n");
  for (const g of guests) {
    console.log(g.name);
    console.log(`  ${origin}/am?invite=${g.inviteCode}#check-in`);
    console.log(`  ${origin}/en?invite=${g.inviteCode}#check-in\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
