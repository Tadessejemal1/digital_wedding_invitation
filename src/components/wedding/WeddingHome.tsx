import { HeroSection } from "@/components/wedding/HeroSection";
import { StorySection } from "@/components/wedding/StorySection";
import { InvitationMessage } from "@/components/wedding/InvitationMessage";
import { CountdownSection } from "@/components/wedding/CountdownSection";
import { ProgramSection } from "@/components/wedding/ProgramSection";
import { GallerySection } from "@/components/wedding/GallerySection";
import { LocationSection } from "@/components/wedding/LocationSection";
import { FamilySection } from "@/components/wedding/FamilySection";
import { RsvpSection } from "@/components/wedding/RsvpSection";
import { EntranceCardSection } from "@/components/wedding/EntranceCardSection";
import { GuestbookSection } from "@/components/wedding/GuestbookSection";
import { SharePhotoSection } from "@/components/wedding/SharePhotoSection";
import { GuestInvitePathSync } from "@/components/wedding/GuestInvitePathSync";
import { Footer } from "@/components/wedding/Footer";
import { WeddingPageShell } from "@/components/wedding/WeddingPageShell";
import { getDemoCouple } from "@/lib/demo-data";
import { weddingImages, coupleInfo, getAllGalleryItems } from "@/lib/images";
import { sortProgramItems, weddingProgram } from "@/lib/couple-program";
import { VENUE_MAP_LINK } from "@/lib/maps";
import { howTheyMetStory, invitationMessageStory, journeyStory } from "@/lib/couple-story";
import prisma from "@/lib/prisma";

async function getCouple() {
  try {
    const slug = process.env.INVITE_SLUG || coupleInfo.slug;
    const couple = await prisma.couple.findUnique({
      where: { slug },
      include: {
        gallery: { orderBy: { orderNo: "asc" } },
        program: { orderBy: { startTime: "asc" } },
      },
    });
    return couple;
  } catch {
    return null;
  }
}

export async function WeddingHome({
  locale,
  inviteCode,
}: {
  locale: string;
  inviteCode?: string;
}) {
  const couple = await getCouple();
  const data = couple || getDemoCouple();

  data.groomName = coupleInfo.groomName;
  data.brideName = coupleInfo.brideName;
  data.groomFamily = "";
  data.brideFamily = "";
  data.venueName = "Abo Garden";
  data.venueAddress = "Mekanisa Abo Square (Abo Garden), Addis Ababa, Ethiopia";
  data.howTheyMet = howTheyMetStory;
  data.journey = journeyStory;
  data.invitationMessage = invitationMessageStory;
  data.weddingDate = new Date("2026-11-01T10:00:00.000Z") as unknown as typeof data.weddingDate;
  data.contactPhone = "0911408338";
  data.contactEmail = "Shimelsabera31@gmail.com";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any).program = weddingProgram.map((item, index) => ({
    id: `program-${index + 1}`,
    title: item.title,
    startTime: item.startTime,
    description: item.description,
  }));

  if (locale === "am") {
    const { amharicData } = await import("@/lib/amharic-data");
    data.groomName = amharicData.groomFullName;
    data.brideName = amharicData.brideFullName;
    data.groomBio = amharicData.groomBio;
    data.brideBio = amharicData.brideBio;
    data.howTheyMet = amharicData.howTheyMet;
    data.journey = amharicData.journey;
    data.invitationMessage = amharicData.invitationMessage;
    data.venueName = amharicData.venueName;
    data.venueAddress = amharicData.venueAddress;
    data.receptionName = amharicData.receptionName;
    data.receptionAddress = amharicData.receptionAddress;
    data.groomFamily = amharicData.groomFamily;
    data.brideFamily = amharicData.brideFamily;
    data.contactPhone = amharicData.coordinatorPhone;
    data.contactEmail = amharicData.contactEmail;

    if (data.program) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).program = data.program.map((p: { title: string }) => {
        const amP = amharicData.program[p.title as keyof typeof amharicData.program];
        return amP ? { ...p, ...amP } : p;
      });
    }

    if (data.gallery) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).gallery = data.gallery.map((g: { caption?: string | null }) => {
        const amC = g.caption
          ? amharicData.galleryCaptions[g.caption as keyof typeof amharicData.galleryCaptions]
          : null;
        return amC ? { ...g, caption: amC } : g;
      });
    }
  }

  const showFamily = Boolean(data.brideFamily?.trim() || data.groomFamily?.trim());
  const weddingDate = new Date(data.weddingDate);

  return (
    <WeddingPageShell
      requirePassword={false}
      hero={
        <HeroSection
          groomName={data.groomName}
          brideName={data.brideName}
          weddingDate={weddingDate}
          coverImage={weddingImages.hero}
          requirePassword={false}
        />
      }
    >
      {!inviteCode && <GuestInvitePathSync />}
      <StorySection
        groomName={data.groomName}
        brideName={data.brideName}
        brideImage={weddingImages.bride}
        groomImage={weddingImages.groom}
        groomBio={data.groomBio}
        brideBio={data.brideBio}
        howTheyMet={data.howTheyMet}
        journey={data.journey}
        story={data.story}
      />
      <InvitationMessage message={data.invitationMessage} />
      <CountdownSection targetDate={weddingDate} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProgramSection items={sortProgramItems((data.program as any) || [])} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GallerySection items={getAllGalleryItems(data.gallery as any)} />
      <LocationSection
        venueName={data.venueName}
        venueAddress={data.venueAddress}
        mapLink={VENUE_MAP_LINK}
      />
      {showFamily && (
        <FamilySection brideFamily={data.brideFamily} groomFamily={data.groomFamily} />
      )}
      <RsvpSection
        coupleId={data.id}
        slug={data.slug || coupleInfo.slug}
        weddingDate={weddingDate.toISOString()}
      />
      <EntranceCardSection
        coupleId={data.id}
        slug={data.slug || coupleInfo.slug}
        inviteCode={inviteCode}
      />
      <GuestbookSection />
      <SharePhotoSection coupleId={data.id} slug={data.slug || coupleInfo.slug} />
      <Footer
        groomName={data.groomName}
        brideName={data.brideName}
        coordinatorPhone={data.contactPhone || "0911408338"}
        contactEmail={data.contactEmail || "Shimelsabera31@gmail.com"}
      />
    </WeddingPageShell>
  );
}
