/**
 * Central place to define the canonical site URL used for SEO.
 *
 * IMPORTANT:
 * - Set NEXT_PUBLIC_SITE_URL to your production domain (e.g. https://convot.xyz)
 * - On Vercel, VERCEL_URL is provided automatically (hostname without protocol).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/+$/, "");

  // Safe defaults:
  // - In dev, use localhost
  // - In prod (non-Vercel), fall back to the real domain to avoid shipping
  //   incorrect canonicals like http://localhost:3000
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return "https://convot.xyz";
}

export function getSiteOrigin(): URL {
  return new URL(getSiteUrl());
}

