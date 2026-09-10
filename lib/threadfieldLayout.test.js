import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFitScale } from "./threadfieldLayout.js";

describe("getFitScale", () => {
  it("does not upscale when the artboard already fits", () => {
    assert.equal(getFitScale(960, 480, 1400, 700), 1);
  });

  it("scales down to the narrower viewport axis so the strand is not cropped", () => {
    assert.equal(getFitScale(960, 480, 480, 700), 0.5);
    assert.equal(getFitScale(960, 480, 1400, 240), 0.5);
  });

  it("in scroll mode only shrinks to available height, leaving width free to pan", () => {
    assert.equal(
      getFitScale(1400, 480, 700, 240, { scrollMode: true }),
      0.5,
    );
    assert.equal(
      getFitScale(1400, 480, 700, 600, { scrollMode: true }),
      1,
    );
  });
});
