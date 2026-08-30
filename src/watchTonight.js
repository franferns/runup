export function googleSearchUrl(title) {
  const query = `${title.title} ${title.year} Disney+`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// Replace with Play Store listing when the Google TV companion app ships.
export const TV_APP_URL = null;

export function formatRuntime(runtimeMin) {
  const hours = Math.floor(runtimeMin / 60);
  const minutes = runtimeMin % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}
