const PLACEHOLDER_PATTERNS = ["1234567890", "0x0%3A0x0", "0x0:0x0"];

export const HOLY_TRINITY_MAP_LINK =
  "https://www.google.com/maps/place/Holy+Trinity+Cathedral,+Addis+Ababa/@9.0310541,38.7660663,17z/data=!3m1!4b1!4m6!3m5!1s0x164b85b67f087347:0x40aafd183a32957!8m2!3d9.0310541!4d38.7686412!16zL20vMDEwODJq?entry=ttu";

export const PARENTS_HOME_MAP_LINK =
  "https://www.google.com/maps/place/8%C2%B048'56.0%22N+38%C2%B047'30.6%22E/@8.815556,38.791833,17z/data=!3m1!4b1!4m4!3m3!8m2!3d8.8155556!4d38.7918333?entry=ttu";

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
