import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** Clear all entrance check-ins so QRs can be scanned fresh. */
export async function POST() {
  try {
    // Status is what the scanner uses. Also zero scan_count when the column exists.
    let count = 0;
    try {
      const result = await prisma.$executeRawUnsafe(`
        UPDATE weedings.guests
        SET status = 'PENDING',
            checked_in_at = NULL,
            scan_count = 0
        WHERE status = 'CHECKED_IN' OR COALESCE(scan_count, 0) > 0
      `);
      count = typeof result === "number" ? result : 0;
    } catch {
      const result = await prisma.guest.updateMany({
        where: { status: "CHECKED_IN" },
        data: {
          status: "PENDING",
          checkedInAt: null,
        },
      });
      count = result.count;
    }

    return NextResponse.json({
      success: true,
      count,
      message: `Reset ${count} guest(s) for fresh scans`,
    });
  } catch (error) {
    console.error("Reset check-ins failed:", error);
    return NextResponse.json({ error: "Failed to reset check-ins" }, { status: 500 });
  }
}
