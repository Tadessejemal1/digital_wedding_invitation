import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";
import { coupleInfo } from "@/lib/images";

/**
 * Personal invite link opens this: returns the guest's one-time entrance QR.
 * Opening the link confirms attendance so the door scanner accepts the QR.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const slug = request.nextUrl.searchParams.get("slug") || coupleInfo.slug;

  if (!code) {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
  }

  const coupleId = await resolveCoupleId(null, slug);
  if (!coupleId) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  const guest = await prisma.guest.findFirst({
    where: {
      coupleId,
      invited: true,
      inviteCode: { equals: code.toUpperCase(), mode: "insensitive" },
    },
    include: { rsvp: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
  }

  // Opening the personal invite = confirming attendance (so door scan works)
  await prisma.rsvp.upsert({
    where: { guestId: guest.id },
    create: {
      guestId: guest.id,
      attendance: true,
      guestCount: 1,
      plusOne: false,
    },
    update: {
      attendance: true,
    },
  });

  return NextResponse.json({
    guestId: guest.id,
    name: guest.name,
    qrCode: guest.qrCode,
    inviteCode: guest.inviteCode,
    status: guest.status,
    checkedInAt: guest.checkedInAt,
    slug,
  });
}
