import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateInviteCode, generateQrCode } from "@/lib/utils";
import { verifyAdminToken, getAdminTokenFromCookie } from "@/lib/auth";
import { resolveCoupleId } from "@/lib/couple";
import { coupleInfo } from "@/lib/images";
import { z } from "zod";

const guestSchema = z.object({
  coupleId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    let inviteCode = generateInviteCode();
    // Ensure uniqueness
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.guest.findUnique({ where: { inviteCode } });
      if (!exists) break;
      inviteCode = generateInviteCode();
    }

    const guest = await prisma.guest.create({
      data: {
        coupleId,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        inviteCode,
        qrCode: generateQrCode(),
        invited: true,
      },
    });

    return NextResponse.json(guest);
  } catch {
    return NextResponse.json({ error: "Failed to create guest" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const token = getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupleId = request.nextUrl.searchParams.get("coupleId");
  const guests = await prisma.guest.findMany({
    where: coupleId ? { coupleId } : undefined,
    include: { rsvp: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(guests);
}
