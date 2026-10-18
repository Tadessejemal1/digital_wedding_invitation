export const GUEST_PHOTO_LIMIT = 60;
export const GUEST_PHOTO_MAX_BYTES = 4 * 1024 * 1024; // 4 MB
export const GUEST_PHOTO_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base || "photo.jpg";
}
