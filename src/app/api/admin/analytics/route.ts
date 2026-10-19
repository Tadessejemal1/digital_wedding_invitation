import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { coupleInfo } from "@/lib/images";

export async function GET() {
  const [totalGuests, checkedIn, rsvps, guestbookCount, guestPhotoCount, couple] =
    await Promise.all([
      prisma.guest.count(),
      prisma.guest.count({ where: { status: "CHECKED_IN" } }),
      prisma.rsvp.findMany({ include: { guest: true } }),
      prisma.guestbook.count(),
      prisma.guestPhoto.count(),
      prisma.couple.findUnique({
        where: { slug: process.env.INVITE_SLUG || coupleInfo.slug },
        select: { id: true },
      }),
    ]);

  const confirmed = rsvps.filter((r) => r.attendance).length;
  const declined = rsvps.filter((r) => !r.attendance).length;

  return NextResponse.json({
    totalGuests,
    checkedIn,
    confirmed,
    declined,
    guestbookCount,
    guestPhotoCount,
    coupleId: couple?.id || null,
    rsvps,
  });
}
