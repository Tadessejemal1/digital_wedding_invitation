import { weddingImages, coupleInfo } from "./images";
import { howTheyMetStory, journeyStory } from "./couple-story";
import { weddingProgram } from "./couple-program";
import { VENUE_MAP_LINK } from "./maps";

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
    venueName: "Jambo Building",
    venueAddress: "In front of Jambo Building, Addisu Gebeya, Addis Ababa, Ethiopia",
    receptionName: "Tadesse's Parents Home",
    receptionAddress: "Addis Ababa, Ethiopia",
    mapLink: VENUE_MAP_LINK,
    receptionMapLink: VENUE_MAP_LINK,
    coverImage: weddingImages.hero,
      invitePassword: null,
    groomFamily: "Mother: Simanesh Legese\nSister: Bizuayew Jemal",
    brideFamily: "Mother: Dasash Fikadu\nSister: Enanu Kassie",
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
