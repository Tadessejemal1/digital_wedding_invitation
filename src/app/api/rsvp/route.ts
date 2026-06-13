import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateQrCode } from "@/lib/utils";
import { resolveCoupleId } from "@/lib/couple";
import { z } from "zod";

const rsvpSchema = z.object({
  coupleId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  attending: z.boolean(),
  guestCount: z.number().min(1).max(10),
  plusOne: z.boolean(),
  dietaryNotes: z.string().optional(),
  message: z.string().optional(),
});

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

    let guest = await prisma.guest.findFirst({
      where: {
        coupleId,
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
          { name: { equals: data.name, mode: "insensitive" as const } },
        ],
      },
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          coupleId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          qrCode: generateQrCode(),
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
      qrCode: guest.qrCode,
      status: guest.status,
      slug: couple?.slug || process.env.INVITE_SLUG || "TADESSE-HANA",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid RSVP data", details: error.flatten() }, { status: 400 });
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
