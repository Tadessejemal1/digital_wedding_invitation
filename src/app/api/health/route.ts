import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  const isLocalhost =
    !databaseUrl ||
    databaseUrl.includes("localhost") ||
    databaseUrl.includes("127.0.0.1");

  try {
    const couple = await prisma.couple.findFirst({
      select: { id: true, slug: true },
    });

    return NextResponse.json({
      ok: true,
      database: "connected",
      couple: couple?.slug ?? null,
      warning: isLocalhost
        ? "DATABASE_URL points to localhost. This will not work on Vercel."
        : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "Database connection failed",
        warning: isLocalhost
          ? "DATABASE_URL is missing or points to localhost. Set a cloud Postgres URL in Vercel env vars."
          : undefined,
      },
      { status: 503 }
    );
  }
}
