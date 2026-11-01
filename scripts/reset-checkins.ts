/**
 * Clear all entrance check-ins so QRs can be scanned fresh.
 * Usage: npm run db:reset-checkins
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Only status + checkedInAt — production DB may not have scan_count yet
  const result = await prisma.guest.updateMany({
    where: { status: "CHECKED_IN" },
    data: {
      status: "PENDING",
      checkedInAt: null,
    },
  });

  console.log(`Reset ${result.count} checked-in guest(s) → PENDING (fresh scans ready)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
