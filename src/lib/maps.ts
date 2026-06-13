const PLACEHOLDER_PATTERNS = ["1234567890", "0x0%3A0x0", "0x0:0x0"];

export function isInvalidMapEmbedUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

export function getMapEmbedUrl(name: string, address: string, customUrl?: string | null): string {
  const envUrl = customUrl ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;
  if (envUrl && !isInvalidMapEmbedUrl(envUrl)) {
    return envUrl;
  }

  const query = encodeURIComponent(`${name}, ${address}`);
  return `https://maps.google.com/maps?q=${query}&hl=en&z=16&output=embed`;
}
