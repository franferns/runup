const STORAGE_KEY = "runup.v1";

export function defaultState() {
  return {
    v: 1,
    personaId: null,
    budgetHours: null,
    watchedIds: [],
    skippedIds: [],
    progressEpoch: 0,
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState();
    }

    const parsed = JSON.parse(raw);
    if (parsed?.v !== 1) {
      return defaultState();
    }

    return {
      v: 1,
      personaId: parsed.personaId ?? null,
      budgetHours: parsed.budgetHours ?? null,
      watchedIds: Array.isArray(parsed.watchedIds) ? parsed.watchedIds : [],
      skippedIds: Array.isArray(parsed.skippedIds) ? parsed.skippedIds : [],
      progressEpoch:
        typeof parsed.progressEpoch === "number" ? parsed.progressEpoch : 0,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function placementMatchesState(placement, state) {
  return (
    state.personaId === placement.personaId &&
    state.budgetHours === placement.budgetHours
  );
}

export function applyPlacement(placement) {
  const current = loadState();
  const state = {
    v: 1,
    personaId: placement.personaId,
    budgetHours: placement.budgetHours,
    watchedIds: [],
    skippedIds: [],
    progressEpoch: (current.progressEpoch ?? 0) + 1,
  };
  saveState(state);
  return state;
}

export function resetProgress(state) {
  const nextState = {
    ...state,
    watchedIds: [],
    skippedIds: [],
    progressEpoch: (state.progressEpoch ?? 0) + 1,
  };
  saveState(nextState);
  return nextState;
}

export function hasProgress(state) {
  return state.watchedIds.length > 0 || state.skippedIds.length > 0;
}

export function markAlreadySeen(state, titleId) {
  if (state.watchedIds.includes(titleId)) {
    return state;
  }

  const nextState = {
    ...state,
    watchedIds: [...state.watchedIds, titleId],
  };
  saveState(nextState);
  return nextState;
}

export function markSkipped(state, titleId) {
  if (state.skippedIds.includes(titleId)) {
    return state;
  }

  const nextState = {
    ...state,
    skippedIds: [...state.skippedIds, titleId],
  };
  saveState(nextState);
  return nextState;
}

export function applyFitToPace(state, budgetHours) {
  const nextState = {
    ...state,
    budgetHours,
  };
  saveState(nextState);
  return nextState;
}
