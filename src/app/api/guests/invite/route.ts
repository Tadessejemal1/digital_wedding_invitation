import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";

/** Lightweight lookup to prefill RSVP from a personal invite link (no QR until attending). */
export async function GET(request: NextRequest) {
  const coupleIdParam = request.nextUrl.searchParams.get("coupleId");
  const slug = request.nextUrl.searchParams.get("slug");
  const code = request.nextUrl.searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
  }

  const coupleId = await resolveCoupleId(coupleIdParam, slug);
  if (!coupleId) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  const guest = await prisma.guest.findFirst({
    where: {
      coupleId,
      invited: true,
      inviteCode: { equals: code.toUpperCase(), mode: "insensitive" },
    },
    select: { id: true, name: true, inviteCode: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  return NextResponse.json({
    id: guest.id,
    name: guest.name,
    inviteCode: guest.inviteCode,
  });
}
