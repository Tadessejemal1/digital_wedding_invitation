import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken, getAdminTokenFromCookie } from "@/lib/auth";
import { resolveCoupleId } from "@/lib/couple";
import { allocateEntranceTicket } from "@/lib/entrance-tickets";
import { coupleInfo } from "@/lib/images";
import { ENTRANCE_TICKET_MAX, formatEntranceTicket } from "@/lib/utils";
import { z } from "zod";

const bulkSchema = z.object({
  coupleId: z.string().optional(),
  slug: z.string().optional(),
  /** One guest name per line (or CSV first column). */
  names: z.array(z.string().min(1)).min(1).max(ENTRANCE_TICKET_MAX),
});

export async function POST(request: NextRequest) {
  const token = getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = bulkSchema.parse(body);

    const coupleId =
      (await resolveCoupleId(data.coupleId, data.slug || coupleInfo.slug)) || data.coupleId;

    if (!coupleId || coupleId === "demo-couple") {
      return NextResponse.json(
        { error: "Wedding couple not found. Seed the database first." },
        { status: 404 }
      );
    }

    const cleaned = data.names
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => !/^name$/i.test(n));

    const uniqueNames = [...new Set(cleaned)];
    const created: { id: string; name: string; inviteCode: string; qrCode: string }[] = [];

    for (const name of uniqueNames) {
      const ticket = await allocateEntranceTicket(coupleId);
      const guest = await prisma.guest.create({
        data: {
          coupleId,
          name,
          inviteCode: ticket.inviteCode,
          qrCode: ticket.qrCode,
          invited: true,
        },
      });
      created.push({
        id: guest.id,
        name: guest.name,
        inviteCode: guest.inviteCode,
        qrCode: guest.qrCode,
      });
    }

    return NextResponse.json({
      success: true,
      count: created.length,
      guests: created,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid bulk data", details: error.flatten() }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to import guests";
    console.error("Bulk guest create failed:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Create blank entrance tickets EDENAND12R-01 … N (admin). */
export async function PUT(request: NextRequest) {
  const token = getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const count = Math.min(
      ENTRANCE_TICKET_MAX,
      Math.max(1, Number(body?.count) || ENTRANCE_TICKET_MAX)
    );
    const coupleId =
      (await resolveCoupleId(body?.coupleId, body?.slug || coupleInfo.slug)) || body?.coupleId;

    if (!coupleId || coupleId === "demo-couple") {
      return NextResponse.json(
        { error: "Wedding couple not found. Seed the database first." },
        { status: 404 }
      );
    }

    const created: string[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const ticket = await allocateEntranceTicket(coupleId);
        await prisma.guest.create({
          data: {
            coupleId,
            name: `Guest ${formatEntranceTicket(ticket.number).split("-")[1]}`,
            inviteCode: ticket.inviteCode,
            qrCode: ticket.qrCode,
            invited: true,
          },
        });
        created.push(ticket.inviteCode);
      } catch {
        break;
      }
    }

    return NextResponse.json({ success: true, count: created.length, codes: created });
  } catch (error) {
    console.error("Ticket mint failed:", error);
    return NextResponse.json({ error: "Failed to create entrance tickets" }, { status: 400 });
  }
}
