import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";

export async function GET(request: NextRequest) {
  const coupleIdParam = request.nextUrl.searchParams.get("coupleId");
  const slug = request.nextUrl.searchParams.get("slug");
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  const coupleId = await resolveCoupleId(coupleIdParam, slug);
  if (!coupleId) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
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
