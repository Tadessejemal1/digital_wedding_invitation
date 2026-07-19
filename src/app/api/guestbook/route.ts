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

    try {
      const entry = await prisma.guestbook.create({ data });
      return NextResponse.json(entry);
    } catch (dbError) {
      console.error("Guestbook DB error:", dbError);
      // Soft success so client can still email via Web3Forms
      return NextResponse.json({
        id: `local-${Date.now()}`,
        guestName: data.guestName,
        message: data.message,
        createdAt: new Date().toISOString(),
      });
    }
  } catch {
    return NextResponse.json({ error: "Failed to submit message" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const entries = await prisma.guestbook.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([]);
  }
}
