export type RunupState = {
  v: 1;
  personaId: string | null;
  budgetHours: number | null;
  watchedIds: string[];
  skippedIds: string[];
};

export const defaultState = (): RunupState => ({
  v: 1,
  personaId: null,
  budgetHours: null,
  watchedIds: [],
  skippedIds: [],
});

export function normalizeState(raw: unknown): RunupState {
  const parsed = raw as Partial<RunupState> | null;
  return {
    v: 1,
    personaId: parsed?.personaId ?? null,
    budgetHours: parsed?.budgetHours ?? null,
    watchedIds: Array.isArray(parsed?.watchedIds) ? parsed.watchedIds : [],
    skippedIds: Array.isArray(parsed?.skippedIds) ? parsed.skippedIds : [],
  };
}

export function mergeState(current: RunupState, patch: Partial<RunupState>): RunupState {
  const next: RunupState = { ...current };
  const personaChanged =
    patch.personaId !== undefined && patch.personaId !== current.personaId;
  const budgetChanged =
    patch.budgetHours !== undefined && patch.budgetHours !== current.budgetHours;

  if (patch.personaId !== undefined) {
    next.personaId = patch.personaId;
  }
  if (patch.budgetHours !== undefined) {
    next.budgetHours = patch.budgetHours;
  }
  if (personaChanged || budgetChanged) {
    next.watchedIds = [];
    next.skippedIds = [];
  }
  if (patch.watchedIds) {
    next.watchedIds = [...new Set([...next.watchedIds, ...patch.watchedIds])];
  }
  if (patch.skippedIds) {
    next.skippedIds = [...new Set([...next.skippedIds, ...patch.skippedIds])];
  }

  return next;
}
