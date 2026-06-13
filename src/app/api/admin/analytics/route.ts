import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, getAdminTokenFromCookie } from "@/lib/auth";

export async function GET(request: Request) {
  const token = getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalGuests, checkedIn, rsvps, guestbookCount] = await Promise.all([
    prisma.guest.count(),
    prisma.guest.count({ where: { status: "CHECKED_IN" } }),
    prisma.rsvp.findMany({ include: { guest: true } }),
    prisma.guestbook.count(),
  ]);

  const confirmed = rsvps.filter((r) => r.attendance).length;
  const declined = rsvps.filter((r) => !r.attendance).length;

  return NextResponse.json({
    totalGuests,
    checkedIn,
    confirmed,
    declined,
    guestbookCount,
    rsvps,
  });
}
