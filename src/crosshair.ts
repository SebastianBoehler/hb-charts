import { priceAtY } from "./price-scale";
import type { ChartMetrics } from "./types";

export interface CrosshairPoint {
  barIndex: number;
  price: number | null;
  x: number;
  y: number;
}

export function inspectChartPoint(
  metrics: ChartMetrics,
  x: number,
  y: number,
): CrosshairPoint | null {
  if (x < metrics.plotLeft || x > metrics.dataRight) return null;
  const barCount = metrics.end - metrics.start;
  if (barCount <= 0) return null;
  const ratio =
    (x - metrics.plotLeft) / Math.max(1, metrics.dataRight - metrics.plotLeft);
  const barIndex = metrics.start + Math.max(
    0,
    Math.min(barCount - 1, Math.round(ratio * (barCount - 1))),
  );
  const priceBottom = metrics.priceTop + metrics.priceHeight;
  return {
    barIndex,
    price: y >= metrics.priceTop && y <= priceBottom
      ? priceAtY(
          metrics.priceRange,
          y,
          metrics.priceTop,
          metrics.priceHeight,
          metrics.priceScale,
        )
      : null,
    x,
    y,
  };
}
