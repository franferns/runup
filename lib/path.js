export function remainingQueue(
  catalog,
  persona,
  watchedIds = [],
  skippedIds = [],
  budgetHours = null,
) {
  const excluded = new Set([
    ...(persona?.treatAsWatched ?? []),
    ...watchedIds,
    ...skippedIds,
  ]);

  let queue = [...catalog.titles]
    .sort((a, b) => a.order - b.order)
    .filter((title) => !excluded.has(title.id));

  if (budgetHours != null && budgetHours > 0) {
    const budgetMin = budgetHours * 60;
    let totalMin = 0;
    const kept = [];

    for (const title of queue) {
      if (totalMin + title.runtimeMin > budgetMin) {
        break;
      }
      totalMin += title.runtimeMin;
      kept.push(title);
    }

    queue = kept;
  }

  return queue;
}

export function threadfieldQueue(
  catalog,
  persona,
  watchedIds = [],
  skippedIds = [],
  budgetHours = null,
) {
  const excluded = new Set([
    ...(persona?.treatAsWatched ?? []),
    ...skippedIds,
  ]);
  const watchedSet = new Set(watchedIds);

  const ordered = [...catalog.titles]
    .sort((a, b) => a.order - b.order)
    .filter((title) => !excluded.has(title.id));

  const remaining = remainingQueue(
    catalog,
    persona,
    watchedIds,
    skippedIds,
    budgetHours,
  );
  const visibleIds = new Set([
    ...watchedIds.filter((id) => ordered.some((title) => title.id === id)),
    ...remaining.map((title) => title.id),
  ]);

  return ordered
    .filter((title) => visibleIds.has(title.id))
    .map((title) => ({
      ...title,
      strandStatus: watchedSet.has(title.id)
        ? "watched"
        : title.id === remaining[0]?.id
          ? "tonight"
          : "upcoming",
    }));
}

export function queueHours(queue) {
  const totalMin = queue.reduce((sum, title) => sum + title.runtimeMin, 0);
  return Math.round((totalMin / 60) * 10) / 10;
}
