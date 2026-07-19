const PLACEHOLDER_PATTERNS = ["1234567890", "0x0%3A0x0", "0x0:0x0"];

/** Venue location: 9.057490, 38.737534 */
export const VENUE_MAP_LINK =
  "https://maps.google.com/maps?q=9.057490,38.737534&ll=9.057490,38.737534&z=16";

/** @deprecated Use VENUE_MAP_LINK */
export const HOLY_TRINITY_MAP_LINK = VENUE_MAP_LINK;

export const PARENTS_HOME_MAP_LINK = VENUE_MAP_LINK;

export function isInvalidMapEmbedUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

function coordsFromGoogleMapsLink(mapLink: string): { lat: string; lng: string } | null {
  const atMatch = mapLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { lat: atMatch[1], lng: atMatch[2] };
  }

  const dataMatch = mapLink.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    return { lat: dataMatch[1], lng: dataMatch[2] };
  }

  const qMatch = mapLink.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return { lat: qMatch[1], lng: qMatch[2] };
  }

  const llMatch = mapLink.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    return { lat: llMatch[1], lng: llMatch[2] };
  }

  return null;
}

export function getMapEmbedUrl(name: string, address: string, mapLink?: string | null): string {
  if (mapLink && mapLink.includes("google.com/maps")) {
    const coords = coordsFromGoogleMapsLink(mapLink);
    if (coords) {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=16&output=embed`;
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;
  if (envUrl && !isInvalidMapEmbedUrl(envUrl)) {
    return envUrl;
  }

  const query = encodeURIComponent(`${name}, ${address}`);
  return `https://maps.google.com/maps?q=${query}&hl=en&z=16&output=embed`;
}
