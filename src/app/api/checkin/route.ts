import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseQrPayload } from "@/lib/qr";

/** How many times one invitation QR can be scanned for entrance. */
const MAX_ENTRANCE_SCANS = 2;

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

    // Legacy check-ins (before scanCount existed) count as one used scan
    const usedScans =
      guest.status === "CHECKED_IN" ? Math.max(guest.scanCount, 1) : guest.scanCount;

    // Atomic increment guarded by the limit, so two simultaneous scans can't both pass
    const claimed =
      usedScans < MAX_ENTRANCE_SCANS
        ? await prisma.guest.updateMany({
            where: { id: guest.id, scanCount: guest.scanCount },
            data: {
              status: "CHECKED_IN",
              scanCount: usedScans + 1,
              checkedInAt: guest.checkedInAt ?? new Date(),
            },
          })
        : { count: 0 };

    // Each invitation QR allows MAX_ENTRANCE_SCANS entrances — reject after that
    if (claimed.count === 0) {
      return NextResponse.json(
        {
          error: "Rejected — already used",
          guest: {
            id: guest.id,
            name: guest.name,
            inviteCode: guest.inviteCode,
            status: guest.status,
            checkedInAt: guest.checkedInAt,
            scanCount: Math.max(usedScans, MAX_ENTRANCE_SCANS),
          },
          duplicate: true,
          rejected: true,
          checkedInAt: guest.checkedInAt,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.guest.findUniqueOrThrow({
      where: { id: guest.id },
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
        scanCount: updated.scanCount,
      },
      scansRemaining: MAX_ENTRANCE_SCANS - updated.scanCount,
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
