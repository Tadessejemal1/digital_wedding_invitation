import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const guestbookSchema = z.object({
  guestName: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = guestbookSchema.parse(body);

    const entry = await prisma.guestbook.create({ data });

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to submit message" }, { status: 400 });
  }
}

export async function GET() {
  const entries = await prisma.guestbook.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(entries);
}
