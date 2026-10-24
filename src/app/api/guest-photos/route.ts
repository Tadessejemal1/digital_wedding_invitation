import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveCoupleId } from "@/lib/couple";
import {
  GUEST_PHOTO_ALLOWED_TYPES,
  GUEST_PHOTO_LIMIT,
  GUEST_PHOTO_MAX_BYTES,
  sanitizeFileName,
} from "@/lib/guest-photos";

/** Public: remaining slots for the upload form. */
export async function HEAD() {
  const count = await prisma.guestPhoto.count();
  return new NextResponse(null, {
    headers: {
      "X-Photo-Count": String(count),
      "X-Photo-Limit": String(GUEST_PHOTO_LIMIT),
      "X-Photo-Remaining": String(Math.max(0, GUEST_PHOTO_LIMIT - count)),
    },
  });
}

/** Status (public) or photo list for admin (?photos=1, auth required). */
export async function GET(request: NextRequest) {
  const includePhotos = request.nextUrl.searchParams.get("photos") === "1";

  const count = await prisma.guestPhoto.count();
  const remaining = Math.max(0, GUEST_PHOTO_LIMIT - count);

  if (!includePhotos) {
    return NextResponse.json({
      count,
      limit: GUEST_PHOTO_LIMIT,
      remaining,
      full: remaining === 0,
    });
  }

  const photos = await prisma.guestPhoto.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      guestName: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    count,
    limit: GUEST_PHOTO_LIMIT,
    remaining,
    full: remaining === 0,
    photos,
  });
}

/** Guest upload — max 60 photos total. */
export async function POST(request: NextRequest) {
  try {
    const count = await prisma.guestPhoto.count();
    if (count >= GUEST_PHOTO_LIMIT) {
      return NextResponse.json(
        {
          error: "Photo limit reached",
          count,
          limit: GUEST_PHOTO_LIMIT,
          remaining: 0,
        },
        { status: 403 }
      );
    }

    const form = await request.formData();
    const guestName = String(form.get("guestName") || "").trim();
    const file = form.get("photo");
    const coupleIdRaw = form.get("coupleId");
    const slugRaw = form.get("slug");

    if (!guestName) {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 });
    }

    // One special photo per person (by name)
    const alreadyShared = await prisma.guestPhoto.findFirst({
      where: { guestName: { equals: guestName, mode: "insensitive" } },
      select: { id: true },
    });
    if (alreadyShared) {
      return NextResponse.json({ error: "Already shared" }, { status: 409 });
    }

    const mimeType = file.type || "application/octet-stream";
    if (!GUEST_PHOTO_ALLOWED_TYPES.has(mimeType.toLowerCase())) {
      return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > GUEST_PHOTO_MAX_BYTES) {
      return NextResponse.json({ error: "Photo is too large" }, { status: 400 });
    }

    const coupleId = await resolveCoupleId(
      typeof coupleIdRaw === "string" ? coupleIdRaw : null,
      typeof slugRaw === "string" ? slugRaw : null
    );

    const buffer = Buffer.from(await file.arrayBuffer());

    const photo = await prisma.guestPhoto.create({
      data: {
        coupleId,
        guestName,
        fileName: sanitizeFileName(file.name),
        mimeType,
        sizeBytes: buffer.length,
        data: buffer,
      },
      select: {
        id: true,
        guestName: true,
        fileName: true,
        createdAt: true,
      },
    });

    const newCount = count + 1;
    return NextResponse.json({
      ...photo,
      count: newCount,
      limit: GUEST_PHOTO_LIMIT,
      remaining: Math.max(0, GUEST_PHOTO_LIMIT - newCount),
      full: newCount >= GUEST_PHOTO_LIMIT,
    });
  } catch (error) {
    console.error("Guest photo upload error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
