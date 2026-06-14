import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/wedding/HeroSection";
import { StorySection } from "@/components/wedding/StorySection";
import { InvitationMessage } from "@/components/wedding/InvitationMessage";
import { CountdownSection } from "@/components/wedding/CountdownSection";
import { ProgramSection } from "@/components/wedding/ProgramSection";
import { GallerySection } from "@/components/wedding/GallerySection";
import { LocationSection } from "@/components/wedding/LocationSection";
import { FamilySection } from "@/components/wedding/FamilySection";
import { RsvpSection } from "@/components/wedding/RsvpSection";
import { InvitationQrSection } from "@/components/wedding/InvitationQrSection";
import { GuestbookSection } from "@/components/wedding/GuestbookSection";
// import { GiftsSection } from "@/components/wedding/GiftsSection";
import { Footer } from "@/components/wedding/Footer";
import { WeddingPageShell } from "@/components/wedding/WeddingPageShell";
import { getDemoCouple } from "@/lib/demo-data";
import { weddingImages, coupleInfo, getAllGalleryItems } from "@/lib/images";
import { sortProgramItems } from "@/lib/couple-program";

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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const couple = await getCouple();
  const data = couple || getDemoCouple();

  if (locale === "am") {
    const { amharicData } = await import("@/lib/amharic-data");
    data.groomName = amharicData.groomName;
    data.brideName = amharicData.brideName;
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

    if (data.program) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).program = data.program.map(p => {
        const amP = amharicData.program[p.title as keyof typeof amharicData.program];
        return amP ? { ...p, ...amP } : p;
      });
    }

    if (data.gallery) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).gallery = data.gallery.map(g => {
        const amC = g.caption ? amharicData.galleryCaptions[g.caption as keyof typeof amharicData.galleryCaptions] : null;
        return amC ? { ...g, caption: amC } : g;
      });
    }
  }

  return (
    <WeddingPageShell
      requirePassword={false}
      hero={
        <HeroSection
          groomName={data.groomName}
          brideName={data.brideName}
          weddingDate={new Date(data.weddingDate)}
          coverImage={data.coverImage}
          requirePassword={false}
        />
      }
    >
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
      <CountdownSection targetDate={new Date(data.weddingDate)} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProgramSection items={sortProgramItems((data.program as any) || [])} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GallerySection items={getAllGalleryItems(data.gallery as any)} />
      <LocationSection
        venueName={data.venueName}
        venueAddress={data.venueAddress}
        mapLink={data.mapLink}
        receptionName={data.receptionName}
        receptionAddress={data.receptionAddress}
        receptionMapLink={data.receptionMapLink}
      />
      <FamilySection brideFamily={data.brideFamily} groomFamily={data.groomFamily} />
      <RsvpSection coupleId={data.id} slug={data.slug || coupleInfo.slug} />
      <InvitationQrSection coupleId={data.id} slug={data.slug || coupleInfo.slug} />
      {/* <GiftsSection
        cbeAccount={data.cbeAccount}
        telebirr={data.telebirr}
        giftRegistry={data.giftRegistry}
      /> */}
      <GuestbookSection />
      <Footer
        groomName={data.groomName}
        brideName={data.brideName}
        contactPhone={data.contactPhone}
        contactEmail={data.contactEmail}
        socialInstagram={data.socialInstagram}
        socialFacebook={data.socialFacebook}
      />
    </WeddingPageShell>
  );
}
