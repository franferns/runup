import catalog from "../data/official-15.json";
import personas from "../data/personas.json";
import { queueHours, remainingQueue, threadfieldQueue } from "./path.js";

export function buildQueueModel(state) {
  const persona = personas.find((entry) => entry.id === state.personaId);

  if (!persona) {
    return null;
  }

  const queue = remainingQueue(
    catalog,
    persona,
    state.watchedIds,
    state.skippedIds,
    state.budgetHours,
  );
  const strandQueue = threadfieldQueue(
    catalog,
    persona,
    state.watchedIds,
    state.skippedIds,
    state.budgetHours,
  );

  return {
    catalog,
    persona,
    queue,
    strandQueue,
    tonight: queue[0] ?? null,
    upNext: queue.slice(1),
    hours: queueHours(queue),
    budgetNote:
      state.budgetHours != null ? ` · ${state.budgetHours}h budget` : "",
  };
}
