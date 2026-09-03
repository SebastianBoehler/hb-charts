import { describe, expect, test } from "bun:test";
import { barBucketStart, mergeHistoryBars, mergeRealtimeBar } from "./live-bars";
import type { ChartBar } from "./types";

const bar = (time: number, close = 10): ChartBar => ({ close, high: close + 1, low: close - 1, open: close, time });

describe("live bars", () => {
  test("aligns minute, day, week, and month buckets", () => {
    const time = Date.UTC(2026, 8, 3, 15, 22, 42);
    expect(barBucketStart(time, "5")).toBe(Date.UTC(2026, 8, 3, 15, 20));
    expect(barBucketStart(time, "1D")).toBe(Date.UTC(2026, 8, 3));
    expect(new Date(barBucketStart(time, "1W")).getUTCDay()).toBe(1);
    expect(barBucketStart(time, "1M")).toBe(Date.UTC(2026, 8, 1));
  });

  test("replaces the active candle and appends the next", () => {
    const start = Date.UTC(2026, 8, 3, 15);
    expect(mergeRealtimeBar([bar(start)], bar(start + 5_000, 12), "60").at(-1)?.close).toBe(12);
    expect(mergeRealtimeBar([bar(start)], bar(start + 60 * 60_000, 13), "60")).toHaveLength(2);
  });

  test("merges ordered history while preferring current bars", () => {
    expect(mergeHistoryBars([bar(2), bar(1)], [bar(2, 20)])).toEqual([bar(1), bar(2, 20)]);
  });
});
