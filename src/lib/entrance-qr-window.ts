const DAY_MS = 24 * 60 * 60 * 1000;

/** Entrance QR becomes available on the public site 1 day before the wedding. */
export function getEntranceQrOpensAt(weddingDate: Date | string): Date {
  const wedding = typeof weddingDate === "string" ? new Date(weddingDate) : weddingDate;
  return new Date(wedding.getTime() - DAY_MS);
}

export function isEntranceQrWindowOpen(weddingDate: Date | string, now: Date = new Date()): boolean {
  return now.getTime() >= getEntranceQrOpensAt(weddingDate).getTime();
}
