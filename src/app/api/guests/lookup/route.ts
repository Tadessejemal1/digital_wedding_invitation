import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const coupleId = request.nextUrl.searchParams.get("coupleId");
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!coupleId || !query) {
    return NextResponse.json({ error: "Couple ID and search query are required" }, { status: 400 });
  }

  const guest = await prisma.guest.findFirst({
    where: {
      coupleId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { equals: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { qrCode: { equals: query, mode: "insensitive" } },
      ],
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: guest.id,
    name: guest.name,
    qrCode: guest.qrCode,
    status: guest.status,
  });
}
