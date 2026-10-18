import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateInviteCode, generateQrCode } from "@/lib/utils";
import { verifyAdminToken, getAdminTokenFromCookie } from "@/lib/auth";
import { resolveCoupleId } from "@/lib/couple";
import { coupleInfo } from "@/lib/images";
import { z } from "zod";

const bulkSchema = z.object({
  coupleId: z.string().optional(),
  slug: z.string().optional(),
  /** One guest name per line (or CSV first column). */
  names: z.array(z.string().min(1)).min(1).max(500),
});

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const inviteCode = generateInviteCode();
    const exists = await prisma.guest.findUnique({ where: { inviteCode } });
    if (!exists) return inviteCode;
  }
  return `${generateInviteCode()}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

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
      // drop header-like lines
      .filter((n) => !/^name$/i.test(n));

    const uniqueNames = [...new Set(cleaned)];
    const created: { id: string; name: string; inviteCode: string; qrCode: string }[] = [];

    for (const name of uniqueNames) {
      const inviteCode = await uniqueInviteCode();
      const guest = await prisma.guest.create({
        data: {
          coupleId,
          name,
          inviteCode,
          qrCode: generateQrCode(),
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
    console.error("Bulk guest create failed:", error);
    return NextResponse.json({ error: "Failed to import guests" }, { status: 400 });
  }
}
