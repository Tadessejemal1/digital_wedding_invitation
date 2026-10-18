const galleryPhotos = [
  "DSC04821-Recovered.jpg",
  "DSC04900-Recovered.jpg",
  "DSC04901-Recovered.jpg",
  "DSC04993-Recovered.jpg",
  "DSC05039-Recovered.jpg",
  "DSC05073-Recovered.jpg",
] as const;

const photoMeta: Record<string, { caption: string; category: string }> = {
  "DSC04821-Recovered.jpg": { caption: "Together", category: "engagement" },
  "DSC04900-Recovered.jpg": { caption: "Our promise", category: "engagement" },
  "DSC04901-Recovered.jpg": { caption: "Side by side", category: "engagement" },
  "DSC04993-Recovered.jpg": { caption: "Joyful moments", category: "engagement" },
  "DSC05039-Recovered.jpg": { caption: "With love", category: "engagement" },
  "DSC05073-Recovered.jpg": { caption: "Forever starts here", category: "engagement" },
};

export const weddingImages = {
  hero: "/Eden/DSC05073-Recovered.jpg",
  bride: "/Eden/DSC05039-Recovered.jpg",
  groom: "/Eden/DSC04900-Recovered.jpg",
  gallery: galleryPhotos.map((file) => {
    const meta = photoMeta[file] ?? { caption: "Our moments", category: "engagement" };
    return {
      imageUrl: `/Eden/${file}`,
      caption: meta.caption,
      category: meta.category,
    };
  }),
} as const;

export const coupleInfo = {
  slug: "ANDINET-EDEN",
  groomName: "Andinet Ayaleu",
  brideName: "Eden Shimeles",
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
