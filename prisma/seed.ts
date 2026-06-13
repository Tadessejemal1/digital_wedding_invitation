import { PrismaClient } from "@prisma/client";
import { weddingImages, coupleInfo } from "../src/lib/images";
import { howTheyMetStory, journeyStory } from "../src/lib/couple-story";
import { weddingProgram } from "../src/lib/couple-program";

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
    },
    create: {
      slug: coupleInfo.slug,
      groomName: coupleInfo.groomName,
      brideName: coupleInfo.brideName,
      groomBio: "A devoted partner with a warm heart, rooted in faith, family, and Ethiopian tradition.",
      brideBio: "A graceful and joyful soul whose smile lights up every room she enters.",
      howTheyMet: howTheyMetStory,
      journey: journeyStory,
      invitationMessage:
        "With great joy and gratitude, we invite you to join us as we begin our new journey together. Your presence will make our celebration complete.",
      weddingDate: new Date("2026-07-26T10:00:00.000Z"),
      venueName: "Holy Trinity Cathedral",
      venueAddress: "Arat Kilo, Addis Ababa, Ethiopia",
      receptionName: "Skylight Hotel",
      receptionAddress: "Bole, Addis Ababa, Ethiopia",
      mapLink: "https://maps.google.com/?q=Holy+Trinity+Cathedral+Addis+Ababa",
      receptionMapLink: "https://maps.google.com/?q=Skylight+Hotel+Addis+Ababa",
      coverImage: weddingImages.hero,
      invitePassword: "love2026",
      groomFamily: "Mr. & Mrs. Tesfaye Kebede\nBrothers: Dawit & Yonas",
      brideFamily: "Mr. & Mrs. Almaz Desta\nSisters: Selam & Bethlehem",
      cbeAccount: "1000123456789",
      telebirr: "0911-234-567",
      giftRegistry: "https://example.com/registry",
      contactPhone: "+251 911 234 567",
      contactEmail: "tadesse.hana@wedding.com",
      socialInstagram: "https://instagram.com",
      socialFacebook: "https://facebook.com",
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
    { name: "Kebede Tesfaye", email: "kebede@example.com", phone: "+251911111111", qrCode: "KBDE1234" },
    { name: "Almaz Desta", email: "almaz@example.com", phone: "+251922222222", qrCode: "ALMZ5678" },
    { name: "Dawit Tadesse", email: "dawit@example.com", phone: "+251933333333", qrCode: "DAWT9012" },
  ];

  for (const g of sampleGuests) {
    await prisma.guest.upsert({
      where: { qrCode: g.qrCode },
      update: {},
      create: { coupleId: couple.id, ...g },
    });
  }

  console.log("Seed completed!");
  console.log(`Couple: ${couple.groomName} & ${couple.brideName}`);
  console.log(`Slug: /invite/${couple.slug}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
