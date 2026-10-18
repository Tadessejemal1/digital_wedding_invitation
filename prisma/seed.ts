import { PrismaClient } from "@prisma/client";
import { weddingImages, coupleInfo } from "../src/lib/images";
import { howTheyMetStory, invitationMessageStory, journeyStory } from "../src/lib/couple-story";
import { weddingProgram } from "../src/lib/couple-program";
import { VENUE_MAP_LINK } from "../src/lib/maps";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const couple = await prisma.couple.upsert({
    where: { slug: coupleInfo.slug },
    update: {
      groomName: coupleInfo.groomName,
      brideName: coupleInfo.brideName,
      coverImage: weddingImages.hero,
      howTheyMet: howTheyMetStory,
      journey: journeyStory,
      invitationMessage: invitationMessageStory,
      venueName: "Abo Garden",
      venueAddress: "Mekanisa Abo Square (Abo Garden), Addis Ababa, Ethiopia",
      receptionName: "Abo Garden",
      receptionAddress: "Mekanisa Abo Square, Addis Ababa, Ethiopia",
      weddingDate: new Date("2026-11-01T10:00:00.000Z"),
      mapLink: VENUE_MAP_LINK,
      receptionMapLink: VENUE_MAP_LINK,
      invitePassword: null,
      contactPhone: "0911408338",
      contactEmail: "Shimelsabera31@gmail.com",
      groomFamily: "",
      brideFamily: "",
    },
    create: {
      slug: coupleInfo.slug,
      groomName: coupleInfo.groomName,
      brideName: coupleInfo.brideName,
      groomBio: "A devoted partner with a warm heart, rooted in faith, family, and Ethiopian tradition.",
      brideBio: "A graceful and joyful soul whose smile lights up every room she enters.",
      howTheyMet: howTheyMetStory,
      journey: journeyStory,
      invitationMessage: invitationMessageStory,
      weddingDate: new Date("2026-11-01T10:00:00.000Z"),
      venueName: "Abo Garden",
      venueAddress: "Mekanisa Abo Square (Abo Garden), Addis Ababa, Ethiopia",
      receptionName: "Abo Garden",
      receptionAddress: "Mekanisa Abo Square, Addis Ababa, Ethiopia",
      mapLink: VENUE_MAP_LINK,
      receptionMapLink: VENUE_MAP_LINK,
      coverImage: weddingImages.hero,
      invitePassword: null,
      groomFamily: "",
      brideFamily: "",
      cbeAccount: null,
      telebirr: null,
      giftRegistry: null,
      contactPhone: "0911408338",
      contactEmail: "Shimelsabera31@gmail.com",
      socialInstagram: null,
      socialFacebook: null,
    },
  });

  await prisma.program.deleteMany({ where: { coupleId: couple.id } });
  await prisma.program.createMany({
    data: weddingProgram.map((item) => ({
      coupleId: couple.id,
      title: item.title,
      startTime: item.startTime,
      description: item.description,
    })),
  });

  await prisma.gallery.deleteMany({ where: { coupleId: couple.id } });
  await prisma.gallery.createMany({
    data: weddingImages.gallery.map((item, index) => ({
      coupleId: couple.id,
      imageUrl: item.imageUrl,
      caption: item.caption,
      category: item.category,
      orderNo: index + 1,
    })),
  });

  const sampleGuests = [
    {
      name: "Kebede Tesfaye",
      email: "kebede@example.com",
      phone: "+251911111111",
      inviteCode: "EDEN-KBDE",
      qrCode: "KBDE1234",
      invited: true,
    },
    {
      name: "Almaz Desta",
      email: "almaz@example.com",
      phone: "+251922222222",
      inviteCode: "EDEN-ALMZ",
      qrCode: "ALMZ5678",
      invited: true,
    },
    {
      name: "Dawit Andinet",
      email: "dawit@example.com",
      phone: "+251933333333",
      inviteCode: "EDEN-DAWT",
      qrCode: "DAWT9012",
      invited: true,
    },
  ];

  for (const g of sampleGuests) {
    await prisma.guest.upsert({
      where: { qrCode: g.qrCode },
      update: {
        inviteCode: g.inviteCode,
        invited: true,
        name: g.name,
        email: g.email,
        phone: g.phone,
      },
      create: { coupleId: couple.id, ...g },
    });
  }

  console.log("Seed completed!");
  console.log(`Couple: ${couple.groomName} & ${couple.brideName}`);
  console.log(`Slug: /invite/${couple.slug}`);
  console.log("Sample invite codes: EDEN-KBDE, EDEN-ALMZ, EDEN-DAWT");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
