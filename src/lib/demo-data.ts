import { weddingImages, coupleInfo } from "./images";
import { howTheyMetStory, invitationMessageStory, journeyStory } from "./couple-story";
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
    invitationMessage: invitationMessageStory,
    /** Sunday Tikimt 22, 2019 E.C. ≈ November 1, 2026 */
    weddingDate: "2026-11-01T10:00:00.000Z",
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
