import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { drawChart } from "./render-chart";
import type { ChartBar } from "../types";

const bars: ChartBar[] = Array.from({ length: 40 }, (_, index) => ({
  close: 100 + index,
  high: 102 + index,
  low: 98 + index,
  open: 99 + index,
  time: index * 60_000,
  volume: 1_000 + index,
}));

function context() {
  const target = { measureText: (text: string) => ({ width: text.length * 6 }) };
  return new Proxy(target, {
    get(object, property) {
      if (property in object) return object[property as keyof typeof object];
      return () => undefined;
    },
    set() { return true; },
  }) as unknown as CanvasRenderingContext2D;
}

function canvas() {
  return {
    getBoundingClientRect: () => ({ height: 480, width: 800 }),
    getContext: () => context(),
    height: 0,
    width: 0,
  } as unknown as HTMLCanvasElement;
}

let previousWindow: typeof globalThis.window | undefined;

beforeAll(() => {
  previousWindow = globalThis.window;
  Object.assign(globalThis, { window: { devicePixelRatio: 2 } });
});

afterAll(() => {
  Object.assign(globalThis, { window: previousWindow });
});

describe("drawChart", () => {
  test("draws ordered bars and generic layers through one interface", () => {
    const metrics = drawChart(canvas(), {
      bars,
      layers: [{ id: "average", kind: "line", values: bars.map((bar) => bar.close) }],
      viewport: { priceRange: null, rightOffset: 0, visibleBars: 30 },
    });
    expect(metrics?.end).toBe(40);
    expect(metrics?.start).toBe(10);
    expect(metrics?.priceRange.max).toBeGreaterThan(139);
  });

  test("rejects invalid logarithmic domains", () => {
    expect(() => drawChart(canvas(), {
      bars: [{ ...bars[0], low: 0 }],
      priceScale: "log",
      viewport: { priceRange: null, rightOffset: 0, visibleBars: 30 },
    })).toThrow("Log unavailable");
  });
});
