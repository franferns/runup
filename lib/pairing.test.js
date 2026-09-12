import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeRunupState } from "./pairing.js";

function state(overrides = {}) {
  return {
    v: 1,
    personaId: null,
    budgetHours: null,
    watchedIds: [],
    skippedIds: [],
    progressEpoch: 0,
    ...overrides,
  };
}

describe("mergeRunupState placement", () => {
  it("does not treat a null budget as missing and revive an 8-hour remote budget", () => {
    const local = state({
      personaId: "official-15",
      budgetHours: null,
      progressEpoch: 1,
    });
    const remote = state({
      personaId: "official-15",
      budgetHours: 8,
      progressEpoch: 1,
    });

    assert.deepEqual(mergeRunupState(local, remote).budgetHours, null);
    assert.equal(mergeRunupState(local, remote).personaId, "official-15");
  });

  it("keeps local placement after a remote-only reset epoch bump", () => {
    const local = state({
      personaId: "x-men-lane",
      budgetHours: null,
      watchedIds: [],
      progressEpoch: 2,
    });
    const remote = state({
      personaId: "official-15",
      budgetHours: 8,
      watchedIds: [],
      progressEpoch: 2,
    });

    const merged = mergeRunupState(local, remote);
    assert.equal(merged.personaId, "x-men-lane");
    assert.equal(merged.budgetHours, null);
  });

  it("applies a newer remote placement including an 8-hour budget", () => {
    const local = state({
      personaId: "official-15",
      budgetHours: null,
      progressEpoch: 1,
    });
    const remote = state({
      personaId: "official-15",
      budgetHours: 8,
      progressEpoch: 2,
    });

    const merged = mergeRunupState(local, remote);
    assert.equal(merged.personaId, "official-15");
    assert.equal(merged.budgetHours, 8);
  });

  it("hydrates placement from remote when local has none", () => {
    const merged = mergeRunupState(
      state(),
      state({ personaId: "official-15", budgetHours: 8, progressEpoch: 0 }),
    );
    assert.equal(merged.personaId, "official-15");
    assert.equal(merged.budgetHours, 8);
  });
});
