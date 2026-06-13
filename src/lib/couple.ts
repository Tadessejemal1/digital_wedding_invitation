import prisma from "@/lib/prisma";
import { coupleInfo } from "@/lib/images";

export async function resolveCoupleId(
  coupleId?: string | null,
  slug?: string | null
): Promise<string | null> {
  if (coupleId && coupleId !== "demo-couple") {
    const byId = await prisma.couple.findUnique({
      where: { id: coupleId },
      select: { id: true },
    });
    if (byId) return byId.id;
  }

  const coupleSlug = slug || process.env.INVITE_SLUG || coupleInfo.slug;
  const bySlug = await prisma.couple.findUnique({
    where: { slug: coupleSlug },
    select: { id: true },
  });

  return bySlug?.id ?? null;
}
