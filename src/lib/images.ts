export const weddingImages = {
  hero: "/images/M2.jpeg",
  bride: "/images/M9.jpeg",
  groom: "/images/M11.jpeg",
  gallery: [
    { imageUrl: "/images/M1.jpeg", caption: "Bride to be moments", category: "engagement" },
    { imageUrl: "/images/M2.jpeg", caption: "Our bridal shower celebration", category: "engagement" },
    { imageUrl: "/images/M5.jpeg", caption: "Family and friends gathered", category: "family" },
    { imageUrl: "/images/M6.jpeg", caption: "A toast to our future", category: "family" },
    { imageUrl: "/images/M7.jpeg", caption: "Cutting the cake with loved ones", category: "family" },
    { imageUrl: "/images/M9.jpeg", caption: "Elegant bridal portrait", category: "pre-wedding" },
    { imageUrl: "/images/M10.jpeg", caption: "Bride to be portrait", category: "pre-wedding" },
    { imageUrl: "/images/M11.jpeg", caption: "Tadesse", category: "pre-wedding" },
    { imageUrl: "/images/M12.jpeg", caption: "Celebrating graduation together", category: "engagement" },
    { imageUrl: "/images/M13.jpeg", caption: "Our wedding venue", category: "pre-wedding" },
  ],
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
    const dbMatch = dbItems?.find((db) => {
      const normalized = (url: string) => url.replace("/images/m", "/images/M");
      return normalized(db.imageUrl) === normalized(item.imageUrl);
    });

    return {
      id: dbMatch?.id || `photo-${index + 1}`,
      imageUrl: item.imageUrl,
      caption: dbMatch?.caption || item.caption,
      category: dbMatch?.category || item.category,
    };
  });
}
