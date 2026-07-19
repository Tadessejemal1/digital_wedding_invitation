const galleryPhotos = [
  // Studio couple
  "0K8A0067.JPG",
  "0K8A0087.JPG",
  "0K8A0133.JPG",
  // Traditional cultural couple
  "0K8A0218.JPG",
  "0K8A0230.JPG",
  "0K8A0246.JPG",
  "0K8A0250.JPG",
  "0K8A0271.JPG",
  "0K8A0291.JPG",
  // Outdoor western couple
  "0K8A0342.JPG",
  "0K8A0366.JPG",
  "0K8A0450.JPG",
  // Twilight & night couple
  "0K8A0529.JPG",
  "0K8A0538.JPG",
  "0K8A0606.JPG",
  "0K8A0652.JPG",
  "0K8A0711.JPG",
  "0K8A0809.JPG",
  "0K8A0866.JPG",
  "0K8A0873.JPG",
] as const;

const photoMeta: Record<string, { caption: string; category: string }> = {
  "0K8A0067.JPG": { caption: "Together in white", category: "pre-wedding" },
  "0K8A0087.JPG": { caption: "A quiet moment", category: "pre-wedding" },
  "0K8A0133.JPG": { caption: "Love and tenderness", category: "pre-wedding" },
  "0K8A0218.JPG": { caption: "In traditional attire", category: "engagement" },
  "0K8A0230.JPG": { caption: "Heritage outdoors", category: "engagement" },
  "0K8A0246.JPG": { caption: "Traditional beauty", category: "engagement" },
  "0K8A0250.JPG": { caption: "Heritage portrait", category: "engagement" },
  "0K8A0271.JPG": { caption: "Our heritage together", category: "engagement" },
  "0K8A0291.JPG": { caption: "Side by side", category: "engagement" },
  "0K8A0342.JPG": { caption: "Walking into forever", category: "engagement" },
  "0K8A0366.JPG": { caption: "Eyes only for each other", category: "engagement" },
  "0K8A0450.JPG": { caption: "Parkside portrait", category: "engagement" },
  "0K8A0529.JPG": { caption: "Twilight together", category: "engagement" },
  "0K8A0538.JPG": { caption: "By the fountains", category: "engagement" },
  "0K8A0606.JPG": { caption: "Blue hour", category: "engagement" },
  "0K8A0652.JPG": { caption: "Sparkling night", category: "engagement" },
  "0K8A0711.JPG": { caption: "Under our flag", category: "engagement" },
  "0K8A0809.JPG": { caption: "Nighttime celebration", category: "engagement" },
  "0K8A0866.JPG": { caption: "Night smiles", category: "engagement" },
  "0K8A0873.JPG": { caption: "Close and joyful", category: "engagement" },
};

export const weddingImages = {
  hero: "/images/0K8A0230.JPG",
  bride: "/images/0K8A0023.JPG",
  groom: "/images/0K8A0478.JPG",
  gallery: galleryPhotos.map((file) => {
    const meta = photoMeta[file] ?? { caption: "Our moments", category: "engagement" };
    return {
      imageUrl: `/images/${file}`,
      caption: meta.caption,
      category: meta.category,
    };
  }),
} as const;

export const coupleInfo = {
  slug: "TADESSE-HANA",
  groomName: "Tadesse",
  brideName: "Hana",
} as const;

export function getAllGalleryItems(
  dbItems?: { id: string; imageUrl: string; caption?: string | null; category: string }[]
) {
  return weddingImages.gallery.map((item, index) => {
    const dbMatch = dbItems?.find((db) => db.imageUrl === item.imageUrl);

    return {
      id: dbMatch?.id || `photo-${index + 1}`,
      imageUrl: item.imageUrl,
      caption: dbMatch?.caption || item.caption,
      category: dbMatch?.category || item.category,
    };
  });
}
