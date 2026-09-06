export const ENABLE_POSTERS =
  process.env.NEXT_PUBLIC_ENABLE_POSTERS !== "false";

const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w500";

export function posterUrl(title) {
  if (!ENABLE_POSTERS || !title?.tmdbPosterPath) {
    return null;
  }

  const path = title.tmdbPosterPath.startsWith("/")
    ? title.tmdbPosterPath
    : `/${title.tmdbPosterPath}`;

  return `${TMDB_POSTER_BASE}${path}`;
}
