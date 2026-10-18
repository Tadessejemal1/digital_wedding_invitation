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

/** Entrance QR identifier stored on the guest. */
export function generateQrCode(): string {
  return randomCode(8);
}

/** Personal invite / confirmation code shared with the guest (e.g. EDEN-A7K2). */
export function generateInviteCode(prefix = "EDEN"): string {
  return `${prefix}-${randomCode(4)}`;
}
