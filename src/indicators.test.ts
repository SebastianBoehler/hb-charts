import { describe, expect, test } from "bun:test";
import { buildStandardIndicators } from "./indicators";
import { atr, bollinger, ema, rsi } from "./indicator-math";
import type { ChartBar } from "./types";

const bars: ChartBar[] = Array.from({ length: 80 }, (_, index) => ({
  close: 100 + index + (index % 4),
  high: 102 + index + (index % 4),
  low: 98 + index + (index % 4),
  open: 99 + index,
  time: index * 60_000,
  volume: 1_000 + index,
}));

describe("standard indicators", () => {
  test("builds aligned EMA values", () => {
    expect(ema(bars.map((bar) => bar.close), 12)).toHaveLength(bars.length);
  });

  test("warms ATR and RSI before publishing values", () => {
    expect(atr(bars, 14).slice(0, 13).every((value) => value === null)).toBe(true);
    expect(rsi(bars.map((bar) => bar.close), 14)[13]).toBeNull();
    expect(rsi(bars.map((bar) => bar.close), 14)[14]).toBeNumber();
  });

  test("builds complete Bollinger bands", () => {
    const bands = bollinger(bars.map((bar) => bar.close));
    expect(bands.middle[19]).toBeNumber();
    expect(bands.lower[19]!).toBeLessThan(bands.upper[19]!);
  });

  test("maps indicators to generic price and pane layers", () => {
    const result = buildStandardIndicators(bars, ["ema", "macd", "rsi", "volume"]);
    expect(result.layers.some((layer) => layer.id === "ema-12" && !layer.paneId)).toBe(true);
    expect(result.panes.map((pane) => pane.id)).toEqual(["volume", "rsi", "macd"]);
  });
});
