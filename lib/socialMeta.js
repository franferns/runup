const SOCIAL_DESCRIPTION_MAX = 125;

/** Trim text for og:description / twitter:description (social preview limit). */
export function trimSocialDescription(text, maxLen = SOCIAL_DESCRIPTION_MAX) {
  const normalized = text?.trim() ?? "";
  if (normalized.length <= maxLen) return normalized;

  const truncated = normalized.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) {
    return `${truncated.slice(0, lastSpace).trimEnd()}…`;
  }
  return `${truncated.trimEnd()}…`;
}

/** Open Graph image object with standard Runup OG dimensions. */
export function ogImage(path, alt) {
  return {
    url: path,
    width: 1200,
    height: 630,
    alt,
  };
}
