import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { resetProgress } from "./storage.js";

const memory = new Map();

globalThis.localStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
};

describe("resetProgress", () => {
  beforeEach(() => {
    memory.clear();
  });

  it("clears watched titles without switching to the 8-hour placement", () => {
    const next = resetProgress({
      v: 1,
      personaId: "official-15",
      budgetHours: null,
      watchedIds: ["x-men"],
      skippedIds: ["wolverine"],
      progressEpoch: 1,
    });

    assert.deepEqual(next.watchedIds, []);
    assert.deepEqual(next.skippedIds, []);
    assert.equal(next.personaId, "official-15");
    assert.equal(next.budgetHours, null);
    assert.equal(next.progressEpoch, 2);
  });
});
