import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let qrCode = typeof body.qrCode === "string" ? body.qrCode.trim() : "";
    let guestId = typeof body.guestId === "string" ? body.guestId.trim() : "";

    // Support raw QR JSON payload: { guestId, qrCode, type: "wedding-checkin" }
    if (qrCode.startsWith("{")) {
      try {
        const parsed = JSON.parse(qrCode);
        if (parsed.qrCode) qrCode = String(parsed.qrCode).trim();
        if (parsed.guestId) guestId = String(parsed.guestId).trim();
      } catch {
        // keep as plain string
      }
    }

    const guest = await prisma.guest.findFirst({
      where: guestId
        ? { id: guestId }
        : qrCode
          ? {
              OR: [
                { qrCode },
                { inviteCode: { equals: qrCode, mode: "insensitive" } },
              ],
            }
          : undefined,
      include: { rsvp: true },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Invalid invitation QR", rejected: true },
        { status: 404 }
      );
    }

    if (!guest.invited) {
      return NextResponse.json(
        {
          error: "Not an invited guest — entrance not allowed",
          guest: { id: guest.id, name: guest.name, inviteCode: guest.inviteCode, status: guest.status },
          notInvited: true,
          rejected: true,
        },
        { status: 403 }
      );
    }

    // One invitation QR = one entrance only — reject on any later scan
    if (guest.status === "CHECKED_IN") {
      return NextResponse.json(
        {
          error: "Already checked in — this QR was used and is now rejected",
          guest: {
            id: guest.id,
            name: guest.name,
            inviteCode: guest.inviteCode,
            status: guest.status,
            checkedInAt: guest.checkedInAt,
          },
          duplicate: true,
          rejected: true,
          checkedInAt: guest.checkedInAt,
        },
        { status: 409 }
      );
    }

    if (guest.status === "DECLINED") {
      return NextResponse.json(
        {
          error: "This invitation was declined — entrance not allowed",
          guest: { id: guest.id, name: guest.name, inviteCode: guest.inviteCode, status: guest.status },
          notAttending: true,
          rejected: true,
        },
        { status: 403 }
      );
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: { status: "CHECKED_IN", checkedInAt: new Date() },
      include: { rsvp: true },
    });

    // Ensure attendance is marked so dashboard stats stay consistent
    await prisma.rsvp.upsert({
      where: { guestId: guest.id },
      create: {
        guestId: guest.id,
        attendance: true,
        guestCount: 1,
        plusOne: false,
      },
      update: { attendance: true },
    });

    return NextResponse.json({
      success: true,
      guest: {
        id: updated.id,
        name: updated.name,
        inviteCode: updated.inviteCode,
        status: updated.status,
        checkedInAt: updated.checkedInAt,
      },
      message: "Checked in successfully — invitation used for entrance",
    });
  } catch {
    return NextResponse.json({ error: "Check-in failed", rejected: true }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const qrCode = request.nextUrl.searchParams.get("qr");
  if (!qrCode) {
    return NextResponse.json({ error: "QR code required" }, { status: 400 });
  }

  const guest = await prisma.guest.findFirst({
    where: {
      OR: [
        { qrCode },
        { inviteCode: { equals: qrCode, mode: "insensitive" } },
      ],
    },
    include: { rsvp: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json(guest);
}
