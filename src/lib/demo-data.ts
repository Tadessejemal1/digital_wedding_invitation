import { weddingImages, coupleInfo } from "./images";
import { howTheyMetStory, journeyStory } from "./couple-story";
import { weddingProgram } from "./couple-program";

export function getDemoCouple() {
  return {
    id: "demo-couple",
    slug: coupleInfo.slug,
    groomName: coupleInfo.groomName,
    brideName: coupleInfo.brideName,
    groomBio: "A devoted partner with a warm heart, rooted in faith, family, and Ethiopian tradition.",
    brideBio: "A graceful and joyful soul whose smile lights up every room she enters.",
    story: null,
    howTheyMet: howTheyMetStory,
    journey: journeyStory,
    invitationMessage:
      "With great joy and gratitude, we invite you to join us as we begin our new journey together. Your presence will make our celebration complete.",
    weddingDate: "2026-07-26T10:00:00.000Z",
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
    program: weddingProgram.map((item, index) => ({
      id: String(index + 1),
      ...item,
    })),
    gallery: weddingImages.gallery.map((item, index) => ({
      id: String(index + 1),
      ...item,
    })),
  };
}
