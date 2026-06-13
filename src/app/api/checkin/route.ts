import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, getAdminTokenFromCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { qrCode, guestId } = await request.json();

    const guest = await prisma.guest.findFirst({
      where: qrCode ? { qrCode } : { id: guestId },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    if (guest.status === "CHECKED_IN") {
      return NextResponse.json(
        { error: "Already checked in", guest, duplicate: true },
        { status: 409 }
      );
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: { status: "CHECKED_IN", checkedInAt: new Date() },
    });

    return NextResponse.json({ success: true, guest: updated });
  } catch {
    return NextResponse.json({ error: "Check-in failed" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const qrCode = request.nextUrl.searchParams.get("qr");
  if (!qrCode) {
    return NextResponse.json({ error: "QR code required" }, { status: 400 });
  }

  const guest = await prisma.guest.findUnique({
    where: { qrCode },
    include: { rsvp: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json(guest);
}
