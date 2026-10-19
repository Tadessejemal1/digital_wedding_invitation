export const weddingProgram = [
  {
    title: "Bridal & Groom House",
    startTime: "10:00 AM – 12:00 PM",
    description: "The celebration begins at the bridal and groom house.",
  },
  {
    title: "Photo Shoot",
    startTime: "",
    description: "Photo shoot with the couple, family, and guests.",
  },
  {
    title: "Abo Garden Dinner Program",
    startTime: "6:00 PM",
    description: "Dinner program at Abo Garden with family and guests.",
  },
  {
    title: "Go to Stay House",
    startTime: "After Dinner",
    description: "The couple proceeds to their stay house for the night.",
  },
] as const;

export const programDisplayOrder = weddingProgram.map((item) => item.title);

export function sortProgramItems<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a, b) => programDisplayOrder.indexOf(a.title as any) - programDisplayOrder.indexOf(b.title as any)
  );
}
