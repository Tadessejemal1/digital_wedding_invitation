export const weddingProgram = [
  {
    title: "Bridal House",
    startTime: "06:00 AM LT",
    description: "The celebration begins at the bridal house.",
  },
  {
    title: "Lunch Ceremony",
    startTime: "07:00 AM LT",
    description: "Lunch ceremony with family and guests.",
  },
  {
    title: "Go to Stay House",
    startTime: "01:00 AM LT (Night)",
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
