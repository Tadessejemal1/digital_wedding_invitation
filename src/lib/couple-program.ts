export const weddingProgram = [
  {
    title: "Bridal House",
    startTime: "12:00 PM",
    description: "The celebration begins at the bridal house.",
  },
  {
    title: "Lunch Ceremony",
    startTime: "01:00 PM",
    description: "Lunch ceremony with family and guests.",
  },
  {
    title: "Go to Stay House",
    startTime: "07:00 PM",
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
