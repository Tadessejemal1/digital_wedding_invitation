import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";
import { getDatabaseErrorMessage } from "@/lib/db-errors";
import { generateInviteCode, generateQrCode } from "@/lib/utils";
import { z } from "zod";

const rsvpSchema = z.object({
  coupleId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  attending: z.boolean(),
  guestCount: z.number().min(1).max(10).optional().default(1),
  plusOne: z.boolean().optional().default(false),
  dietaryNotes: z.string().optional(),
  message: z.string().optional(),
});

async function uniqueInviteCode() {
  for (let i = 0; i < 20; i++) {
    const inviteCode = generateInviteCode();
    const exists = await prisma.guest.findUnique({ where: { inviteCode } });
    if (!exists) return inviteCode;
  }
  throw new Error("Could not allocate invite code");
}

async function uniqueQrCode() {
  for (let i = 0; i < 20; i++) {
    const qrCode = generateQrCode();
    const exists = await prisma.guest.findUnique({ where: { qrCode } });
    if (!exists) return qrCode;
  }
  throw new Error("Could not allocate QR code");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = rsvpSchema.parse(body);

    const coupleId = await resolveCoupleId(data.coupleId, data.slug);
    if (!coupleId) {
      return NextResponse.json(
        { error: "Wedding not found. Please check the database connection and seed data." },
        { status: 404 }
      );
    }

    const name = data.name.trim();

    // Prefer matching a pre-invited guest by name (admin bulk list)
    let guest = await prisma.guest.findFirst({
      where: {
        coupleId,
        name: { equals: name, mode: "insensitive" },
      },
      orderBy: { invited: "desc" },
    });

    if (guest) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          name,
          email: data.email || guest.email,
          phone: data.phone || guest.phone,
          status: data.attending ? guest.status : "DECLINED",
        },
      });
    } else {
      // Open attendance: track the reply; no entrance QR without a personal invite link
      guest = await prisma.guest.create({
        data: {
          coupleId,
          name,
          email: data.email || null,
          phone: data.phone || null,
          inviteCode: await uniqueInviteCode(),
          qrCode: await uniqueQrCode(),
          invited: false,
          status: data.attending ? "PENDING" : "DECLINED",
        },
      });
    }

    await prisma.rsvp.upsert({
      where: { guestId: guest.id },
      create: {
        guestId: guest.id,
        attendance: data.attending,
        guestCount: data.guestCount,
        plusOne: data.plusOne,
        dietaryNotes: data.dietaryNotes || null,
        message: data.message || null,
      },
      update: {
        attendance: data.attending,
        guestCount: data.guestCount,
        plusOne: data.plusOne,
        dietaryNotes: data.dietaryNotes || null,
        message: data.message || null,
      },
    });

    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      select: { slug: true },
    });

    return NextResponse.json({
      success: true,
      guestId: guest.id,
      status: data.attending ? guest.status : "DECLINED",
      slug: couple?.slug || process.env.INVITE_SLUG || "ANDINET-EDEN",
      // Entrance QR is only via personal /my-invite/[code] link from the hosts
      qrAvailable: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid RSVP data", details: error.flatten() }, { status: 400 });
    }
    const dbMessage = getDatabaseErrorMessage(error);
    if (dbMessage) {
      console.error("RSVP database error:", error);
      return NextResponse.json({ error: dbMessage }, { status: 503 });
    }
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Failed to submit RSVP" }, { status: 500 });
  }
}

export async function GET() {
  const rsvps = await prisma.rsvp.findMany({
    include: { guest: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rsvps);
}
