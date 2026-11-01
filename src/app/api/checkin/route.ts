import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseQrPayload } from "@/lib/qr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let qrCode = typeof body.qrCode === "string" ? body.qrCode.trim() : "";
    let guestId = typeof body.guestId === "string" ? body.guestId.trim() : "";

    // Support check-in URL, legacy JSON, or plain code
    if (qrCode) {
      const parsed = parseQrPayload(qrCode);
      if (parsed.qrCode) qrCode = parsed.qrCode;
      if (parsed.guestId) guestId = parsed.guestId;
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
      select: {
        id: true,
        name: true,
        inviteCode: true,
        status: true,
        invited: true,
        checkedInAt: true,
      },
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
          guest: {
            id: guest.id,
            name: guest.name,
            inviteCode: guest.inviteCode,
            status: guest.status,
          },
          notInvited: true,
          rejected: true,
        },
        { status: 403 }
      );
    }

    if (guest.status === "DECLINED") {
      return NextResponse.json(
        {
          error: "This invitation was declined — entrance not allowed",
          guest: {
            id: guest.id,
            name: guest.name,
            inviteCode: guest.inviteCode,
            status: guest.status,
          },
          notAttending: true,
          rejected: true,
        },
        { status: 403 }
      );
    }

    // One QR = one entrance — status is the source of truth (survives reset)
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

    const checkedInAt = new Date();

    // Atomic claim: only succeed if still PENDING
    const claimed = await prisma.guest.updateMany({
      where: { id: guest.id, status: "PENDING" },
      data: {
        status: "CHECKED_IN",
        checkedInAt,
      },
    });

    if (claimed.count === 0) {
      return NextResponse.json(
        {
          error: "Already checked in — this QR was used and is now rejected",
          guest: {
            id: guest.id,
            name: guest.name,
            inviteCode: guest.inviteCode,
            status: "CHECKED_IN",
          },
          duplicate: true,
          rejected: true,
        },
        { status: 409 }
      );
    }

    void prisma.rsvp
      .upsert({
        where: { guestId: guest.id },
        create: {
          guestId: guest.id,
          attendance: true,
          guestCount: 1,
          plusOne: false,
        },
        update: { attendance: true },
      })
      .catch((err) => console.error("Check-in RSVP sync failed:", err));

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        inviteCode: guest.inviteCode,
        status: "CHECKED_IN",
        checkedInAt,
      },
      message: "Entrance checked in successfully",
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
