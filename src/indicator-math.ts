import type { ChartBar, NumericSeries } from "./types";

function empty(length: number): NumericSeries {
  return Array.from({ length }, () => null);
}

export function ema(values: readonly number[], length: number): NumericSeries {
  if (!Number.isInteger(length) || length < 1) throw new RangeError("EMA length must be positive.");
  const output = empty(values.length);
  const alpha = 2 / (length + 1);
  let previous: number | null = null;
  values.forEach((value, index) => {
    previous = previous === null ? value : value * alpha + previous * (1 - alpha);
    output[index] = previous;
  });
  return output;
}

export function sma(values: readonly number[], length: number): NumericSeries {
  if (!Number.isInteger(length) || length < 1) throw new RangeError("SMA length must be positive.");
  const output = empty(values.length);
  let total = 0;
  values.forEach((value, index) => {
    total += value;
    if (index >= length) total -= values[index - length];
    if (index >= length - 1) output[index] = total / length;
  });
  return output;
}

export function atr(bars: readonly ChartBar[], length: number): NumericSeries {
  if (!Number.isInteger(length) || length < 1) throw new RangeError("ATR length must be positive.");
  const ranges = bars.map((bar, index) => {
    const previous = bars[index - 1]?.close;
    if (previous === undefined) return bar.high - bar.low;
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - previous),
      Math.abs(bar.low - previous),
    );
  });
  return sma(ranges, length);
}

export function rsi(values: readonly number[], length: number): NumericSeries {
  if (!Number.isInteger(length) || length < 1) throw new RangeError("RSI length must be positive.");
  const output = empty(values.length);
  for (let index = length; index < values.length; index += 1) {
    let gains = 0;
    let losses = 0;
    for (let point = index - length + 1; point <= index; point += 1) {
      const change = values[point] - values[point - 1];
      if (change >= 0) gains += change;
      else losses -= change;
    }
    output[index] = losses === 0 ? (gains === 0 ? 50 : 100) : 100 - 100 / (1 + gains / losses);
  }
  return output;
}

export function stochastic(
  bars: readonly ChartBar[],
  length: number,
): NumericSeries {
  const output = empty(bars.length);
  bars.forEach((bar, index) => {
    const window = bars.slice(Math.max(0, index - length + 1), index + 1);
    if (window.length < length) return;
    const low = Math.min(...window.map((entry) => entry.low));
    const high = Math.max(...window.map((entry) => entry.high));
    output[index] = high === low ? 50 : ((bar.close - low) / (high - low)) * 100;
  });
  return output;
}

export function vwap(bars: readonly ChartBar[]): NumericSeries {
  let volumeTotal = 0;
  let valueTotal = 0;
  return bars.map((bar) => {
    const volume = bar.volume ?? 0;
    volumeTotal += volume;
    valueTotal += ((bar.high + bar.low + bar.close) / 3) * volume;
    return volumeTotal > 0 ? valueTotal / volumeTotal : null;
  });
}

export function bollinger(
  values: readonly number[],
  length = 20,
  multiplier = 2,
) {
  const middle = sma(values, length);
  const lower = empty(values.length);
  const upper = empty(values.length);
  values.forEach((_, index) => {
    if (index < length - 1) return;
    const window = values.slice(index - length + 1, index + 1);
    const mean = middle[index]!;
    const deviation = Math.sqrt(
      window.reduce((total, value) => total + (value - mean) ** 2, 0) / length,
    );
    lower[index] = mean - deviation * multiplier;
    upper[index] = mean + deviation * multiplier;
  });
  return { lower, middle, upper };
}

export function macd(values: readonly number[], fast = 12, slow = 26, signal = 9) {
  const fastValues = ema(values, fast);
  const slowValues = ema(values, slow);
  const line = values.map((_, index) => fastValues[index]! - slowValues[index]!);
  const signalValues = ema(line, signal);
  const histogram = line.map((value, index) => value - signalValues[index]!);
  return { histogram, line, signal: signalValues };
}
