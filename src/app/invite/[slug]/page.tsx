import prisma from "@/lib/prisma";
import { getDemoCouple } from "@/lib/demo-data";
import { InviteCard } from "@/components/invite/InviteCard";
import { notFound } from "next/navigation";

async function getGuest(slug: string, guestId?: string) {
  try {
    const couple = await prisma.couple.findUnique({ where: { slug } });
    if (!couple) return null;

    if (guestId) {
      const guest = await prisma.guest.findFirst({
        where: { id: guestId, coupleId: couple.id },
      });
      return guest ? { couple, guest } : null;
    }
    return { couple, guest: null };
  } catch {
    return null;
  }
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string }>;
}) {
  const { slug } = await params;
  const { guest: guestId } = await searchParams;

  const result = await getGuest(slug, guestId);
  const demo = getDemoCouple();

  if (!result && slug !== demo.slug) {
    notFound();
  }

  const couple = result?.couple || demo;
  const guest = result?.guest;

  return (
    <InviteCard
      slug={slug}
      groomName={couple.groomName}
      brideName={couple.brideName}
      weddingDate={new Date(couple.weddingDate)}
      guest={
        guest
          ? {
              id: guest.id,
              name: guest.name,
              qrCode: guest.qrCode,
              status: guest.status,
            }
          : null
      }
    />
  );
}
