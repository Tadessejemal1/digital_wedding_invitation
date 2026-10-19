import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";
import { allocateEntranceTicket } from "@/lib/entrance-tickets";
import { coupleInfo } from "@/lib/images";
import { formatEntranceTicket, sortByInviteCode } from "@/lib/utils";
import { z } from "zod";

const guestSchema = z.object({
  coupleId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = guestSchema.parse(body);

    const coupleId =
      (await resolveCoupleId(data.coupleId, data.slug || coupleInfo.slug)) || data.coupleId;

    if (!coupleId || coupleId === "demo-couple") {
      return NextResponse.json(
        { error: "Wedding couple not found. Seed the database first." },
        { status: 404 }
      );
    }

    const ticket = await allocateEntranceTicket(coupleId);
    const guest = await prisma.guest.create({
      data: {
        coupleId,
        name: data.name?.trim() || `Guest ${formatEntranceTicket(ticket.number).split("-")[1]}`,
        phone: data.phone || null,
        email: data.email || null,
        inviteCode: ticket.inviteCode,
        qrCode: ticket.qrCode,
        invited: true,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create guest";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const coupleId = request.nextUrl.searchParams.get("coupleId");
  const guests = await prisma.guest.findMany({
    where: coupleId ? { coupleId } : undefined,
    include: { rsvp: true },
  });

  return NextResponse.json(sortByInviteCode(guests));
}
