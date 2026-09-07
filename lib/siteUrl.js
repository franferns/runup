const DEFAULT_SITE_URL = "https://www.before-doomsday.com";

/** Canonical origin for metadata, sitemap, and robots. Empty env vars fall back safely. */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv || DEFAULT_SITE_URL;
}
