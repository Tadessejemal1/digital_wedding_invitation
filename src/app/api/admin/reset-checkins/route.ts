import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** Clear all entrance check-ins so QRs can be scanned fresh. */
export async function POST() {
  try {
    const result = await prisma.guest.updateMany({
      where: { status: "CHECKED_IN" },
      data: {
        status: "PENDING",
        checkedInAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Reset ${result.count} checked-in guest(s)`,
    });
  } catch (error) {
    console.error("Reset check-ins failed:", error);
    return NextResponse.json({ error: "Failed to reset check-ins" }, { status: 500 });
  }
}
