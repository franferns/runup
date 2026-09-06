import catalog from "../data/official-15.json";

export function getCatalog() {
  return catalog;
}

export function getOrderedTitles() {
  return [...catalog.titles].sort((a, b) => a.order - b.order);
}

export function getTotalRuntimeHours() {
  const totalMin = catalog.titles.reduce(
    (sum, title) => sum + title.runtimeMin,
    0,
  );
  return Math.round((totalMin / 60) * 10) / 10;
}
