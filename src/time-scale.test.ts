import { describe, expect, test } from "bun:test";
import { latestRightPaddingBars, panTimeViewport, scaleTimeViewport } from "./time-scale";

const viewport = { priceRange: null, rightOffset: 0, visibleBars: 100 };

describe("time scale", () => {
  test("pans within available history", () => {
    expect(panTimeViewport(viewport, 500, 42).rightOffset).toBe(42);
    expect(panTimeViewport(viewport, 100, 42).rightOffset).toBe(0);
  });

  test("keeps the latest bar visible when zooming at the boundary", () => {
    expect(scaleTimeViewport(viewport, 500, 200).rightOffset).toBe(0);
  });

  test("clamps density to a usable minimum", () => {
    expect(scaleTimeViewport(viewport, 500, 2).visibleBars).toBe(30);
  });

  test("adds future room only at the latest boundary", () => {
    expect(latestRightPaddingBars(100, 0)).toBe(6);
    expect(latestRightPaddingBars(100, 5)).toBe(0);
  });
});
