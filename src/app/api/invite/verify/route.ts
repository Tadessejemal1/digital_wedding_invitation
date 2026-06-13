import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const expected = process.env.INVITE_PASSWORD || "love2026";

    if (code !== expected) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
}
