import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";

export async function GET(request: NextRequest) {
  const coupleIdParam = request.nextUrl.searchParams.get("coupleId");
  const slug = request.nextUrl.searchParams.get("slug");
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  const coupleId = await resolveCoupleId(coupleIdParam, slug);
  if (!coupleId) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  const inviteCode = query.toUpperCase();

  // Exact invite-code lookup only — no open name search
  const guest = await prisma.guest.findFirst({
    where: {
      coupleId,
      invited: true,
      inviteCode: { equals: inviteCode, mode: "insensitive" },
    },
    include: { rsvp: true },
  });

  if (!guest) {
    return NextResponse.json(
      { error: "Invalid invite code. Please use the personal code you were sent." },
      { status: 404 }
    );
  }

  // Entrance QR is only for guests who confirmed attendance
  if (!guest.rsvp || guest.rsvp.attendance !== true) {
    return NextResponse.json(
      { error: "No entrance invitation found. Please confirm attendance first with your invite code." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: guest.id,
    name: guest.name,
    qrCode: guest.qrCode,
    inviteCode: guest.inviteCode,
    status: guest.status,
    checkedInAt: guest.checkedInAt,
  });
}
