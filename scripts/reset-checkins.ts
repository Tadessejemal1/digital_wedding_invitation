/**
 * Clear all entrance check-ins so QRs can be scanned fresh.
 * Usage: npm run db:reset-checkins
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Prefer raw SQL so scan_count is cleared when the column exists
  let count = 0;
  try {
    count = await prisma.$executeRawUnsafe(`
      UPDATE weedings.guests
      SET status = 'PENDING',
          checked_in_at = NULL,
          scan_count = 0
      WHERE status = 'CHECKED_IN' OR COALESCE(scan_count, 0) > 0
    `);
  } catch {
    const result = await prisma.guest.updateMany({
      where: { status: "CHECKED_IN" },
      data: { status: "PENDING", checkedInAt: null },
    });
    count = result.count;
  }

  console.log(`Reset ${count} guest(s) → PENDING (fresh scans ready)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
