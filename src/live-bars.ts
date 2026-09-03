import type { ChartBar, ChartResolution } from "./types";

const MINUTE_MS = 60_000;

function utcDayStart(time: number) {
  const date = new Date(time);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function barBucketStart(time: number, resolution: ChartResolution) {
  if (resolution === "1D") return utcDayStart(time);
  if (resolution === "1W") {
    const dayStart = utcDayStart(time);
    return dayStart - ((new Date(dayStart).getUTCDay() + 6) % 7) * 24 * 60 * MINUTE_MS;
  }
  if (resolution === "1M") {
    const date = new Date(time);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  }
  return Math.floor(time / (Number(resolution) * MINUTE_MS)) * Number(resolution) * MINUTE_MS;
}

function isValidBar(bar: ChartBar) {
  return Number.isFinite(bar.time) && [bar.open, bar.high, bar.low, bar.close].every(Number.isFinite);
}

export function mergeRealtimeBar(
  bars: ChartBar[],
  realtimeBar: ChartBar,
  resolution: ChartResolution,
  maxBars = 5_000,
) {
  const nextBar = { ...realtimeBar, time: barBucketStart(realtimeBar.time, resolution) };
  if (!isValidBar(nextBar)) return bars;
  if (!bars.length) return [nextBar];
  const last = bars.at(-1)!;
  if (nextBar.time > last.time) return [...bars, nextBar].slice(-maxBars);
  if (nextBar.time === last.time) return [...bars.slice(0, -1), nextBar];
  const index = bars.findIndex((bar) => bar.time === nextBar.time);
  if (index < 0) return bars;
  const next = [...bars];
  next[index] = nextBar;
  return next;
}

export function mergeHistoryBars(
  historicalBars: ChartBar[],
  currentBars: ChartBar[],
  maxBars = 5_000,
) {
  const byTime = new Map<number, ChartBar>();
  historicalBars.forEach((bar) => isValidBar(bar) && byTime.set(bar.time, bar));
  currentBars.forEach((bar) => isValidBar(bar) && byTime.set(bar.time, bar));
  return [...byTime.values()].sort((left, right) => left.time - right.time).slice(-maxBars);
}
