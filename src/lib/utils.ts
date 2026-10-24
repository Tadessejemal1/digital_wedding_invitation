import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_AM = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_AM = [
  "ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
  "ጁላይ", "ኦገስት", "ሰፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር",
];

/** Fixed format so SSR and client never disagree (Intl locale order can differ). */
export function formatWeddingDate(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Use UTC parts so timezone differences don't shift the calendar day
  const weekday = d.getUTCDay();
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();

  if (locale === "am") {
    return `${WEEKDAYS_AM[weekday]} ${day} ${MONTHS_AM[month]} ${year}`;
  }

  return `${WEEKDAYS_EN[weekday]}, ${MONTHS_EN[month]} ${day}, ${year}`;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

/** Entrance tickets: EDENAND12R-01 … EDENAND12R-500 */
export const ENTRANCE_TICKET_PREFIX = "EDENAND12R";
export const ENTRANCE_TICKET_MAX = 500;

export function formatEntranceTicket(n: number): string {
  return `${ENTRANCE_TICKET_PREFIX}-${String(n).padStart(2, "0")}`;
}

export function parseEntranceTicketNumber(code: string): number | null {
  const match = code
    .trim()
    .toUpperCase()
    .match(new RegExp(`^${ENTRANCE_TICKET_PREFIX}-(\\d+)$`));
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 1 || n > ENTRANCE_TICKET_MAX) return null;
  return n;
}

/** Sort key for invite codes like EDENAND12R-01 … EDENAND12R-500 (numeric, not text). */
export function inviteCodeSortValue(code: string): number {
  const match = code.trim().toUpperCase().match(/-(\d+)$/);
  if (match) {
    const n = Number(match[1]);
    if (Number.isFinite(n)) return n;
  }
  return Number.MAX_SAFE_INTEGER;
}

export function sortByInviteCode<T extends { inviteCode: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => inviteCodeSortValue(a.inviteCode) - inviteCodeSortValue(b.inviteCode)
  );
}

/** @deprecated Prefer formatEntranceTicket — kept for rare fallback IDs. */
export function generateQrCode(): string {
  return randomCode(8);
}

/** @deprecated Prefer formatEntranceTicket — kept for rare fallback IDs. */
export function generateInviteCode(prefix = "EDEN"): string {
  return `${prefix}-${randomCode(4)}`;
}
