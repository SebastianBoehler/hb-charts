import { describe, expect, test } from "bun:test";
import {
  isPriceScaleAvailable,
  normalizePriceRange,
  priceAtY,
  scalePriceRange,
  shiftPriceRange,
  yForPrice,
} from "./price-scale";

describe("price scale", () => {
  test("rejects nonpositive logarithmic values", () => {
    expect(isPriceScaleAvailable([1, 2], "log")).toBe(true);
    expect(isPriceScaleAvailable([0, 2], "log")).toBe(false);
  });

  test("round trips linear and log projections", () => {
    for (const mode of ["linear", "log"] as const) {
      const range = mode === "log" ? { min: 10, max: 1_000 } : { min: -10, max: 90 };
      const y = yForPrice(range, mode === "log" ? 100 : 25, 20, 200, mode);
      expect(priceAtY(range, y, 20, 200, mode)).toBeCloseTo(mode === "log" ? 100 : 25);
    }
  });

  test("adds deterministic headroom", () => {
    expect(normalizePriceRange(100, 200)).toEqual({ min: 96, max: 204 });
  });

  test("zooms around an anchor", () => {
    const next = scalePriceRange({ min: 0, max: 100 }, 25, 0.5);
    expect(next.min).toBeCloseTo(12.5);
    expect(next.max).toBeCloseTo(62.5);
  });

  test("shifts without changing span", () => {
    expect(shiftPriceRange({ min: 10, max: 20 }, 0.5)).toEqual({ min: 15, max: 25 });
  });
});
