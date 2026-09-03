import { snapFillCoordinate, snapStrokeCoordinate } from "../geometry";
import { CHART_PADDING } from "../layout";
import { toneColor, type CandlePalette, type ChartPalette } from "../palette";
import { priceLevelDash, projectPriceLevels } from "../price-levels";
import { priceAtY } from "../price-scale";
import type {
  ChartBar,
  ChartHistogramLayer,
  ChartLineLayer,
  ChartMarker,
  ChartPriceLevel,
  ChartPriceRange,
  ChartTimeRegion,
  PriceScaleMode,
} from "../types";

export interface Projection {
  dataRight: number;
  plotLeft: number;
  plotRight: number;
  range: ChartPriceRange;
  x: (index: number) => number;
  y: (value: number) => number;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  range: ChartPriceRange,
  mode: PriceScaleMode,
  palette: ChartPalette,
  ratio: number,
) {
  ctx.strokeStyle = palette.grid;
  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
  for (let index = 0; index < 5; index += 1) {
    const row = CHART_PADDING.top + (index / 4) * height;
    ctx.beginPath();
    ctx.moveTo(CHART_PADDING.left, snapStrokeCoordinate(row, ratio));
    ctx.lineTo(width - CHART_PADDING.right, snapStrokeCoordinate(row, ratio));
    ctx.stroke();
    const value = priceAtY(range, row, CHART_PADDING.top, height, mode);
    ctx.fillStyle = palette.label;
    ctx.fillText(formatNumber(value), width - CHART_PADDING.right + 8, row + 4);
  }
}

export function drawCandles(
  ctx: CanvasRenderingContext2D,
  bars: readonly ChartBar[],
  projection: Projection,
  candles: CandlePalette,
  ratio: number,
) {
  const spacing = bars.length > 1 ? Math.abs(projection.x(1) - projection.x(0)) : 6;
  const candleWidth = Math.max(1, spacing * 0.62);
  bars.forEach((bar, index) => {
    const color = bar.close >= bar.open ? candles.up : candles.down;
    const x = snapStrokeCoordinate(projection.x(index), ratio);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, snapFillCoordinate(projection.y(bar.high), ratio));
    ctx.lineTo(x, snapFillCoordinate(projection.y(bar.low), ratio));
    ctx.stroke();
    const left = snapFillCoordinate(projection.x(index) - candleWidth / 2, ratio);
    const right = snapFillCoordinate(projection.x(index) + candleWidth / 2, ratio);
    const top = snapFillCoordinate(Math.min(projection.y(bar.open), projection.y(bar.close)), ratio);
    const bottom = snapFillCoordinate(Math.max(projection.y(bar.open), projection.y(bar.close)), ratio);
    ctx.fillRect(left, top, Math.max(1 / ratio, right - left), Math.max(1 / ratio, bottom - top));
  });
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  layer: ChartLineLayer,
  x: (index: number) => number,
  y: (value: number) => number,
  palette: ChartPalette,
) {
  let previous: { index: number; value: number } | null = null;
  layer.values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) {
      previous = null;
      return;
    }
    if (previous) {
      const color = layer.colorMode === "value-sign"
        ? value > 0 ? palette.up : value < 0 ? palette.down : palette.mutedLine
        : layer.color ?? palette.primary;
      ctx.beginPath();
      ctx.moveTo(x(previous.index), y(previous.value));
      ctx.lineTo(x(index), y(value));
      ctx.strokeStyle = color;
      ctx.lineWidth = layer.lineWidth ?? 1.1;
      ctx.stroke();
    }
    previous = { index, value };
  });
}

export function drawHistogram(
  ctx: CanvasRenderingContext2D,
  layer: ChartHistogramLayer,
  bars: readonly ChartBar[],
  x: (index: number) => number,
  y: (value: number) => number,
  baseline: number,
  palette: ChartPalette,
  candles: CandlePalette,
) {
  const spacing = layer.values.length > 1 ? Math.abs(x(1) - x(0)) : 6;
  const width = Math.max(1, spacing * 0.68);
  layer.values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) return;
    const color = layer.colorMode === "bar-direction"
      ? bars[index]?.close >= bars[index]?.open ? candles.volumeUp : candles.volumeDown
      : layer.colorMode === "value-sign"
        ? value > baseline ? palette.up : value < baseline ? palette.down : palette.mutedLine
        : layer.color ?? palette.primary;
    const valueY = y(value);
    const baseY = y(baseline);
    ctx.fillStyle = color;
    ctx.fillRect(x(index) - width / 2, Math.min(valueY, baseY), width, Math.max(1, Math.abs(valueY - baseY)));
  });
}

export function drawRegions(
  ctx: CanvasRenderingContext2D,
  regions: readonly ChartTimeRegion[],
  bars: readonly ChartBar[],
  projection: Projection,
  height: number,
) {
  if (bars.length < 2) return;
  const interval = bars[1].time - bars[0].time;
  regions.forEach((region) => {
    const start = Math.max(0, bars.findIndex((bar) => bar.time + interval > region.startTime));
    let last = -1;
    for (let index = bars.length - 1; index >= 0; index -= 1) {
      if (bars[index].time < region.endTime) {
        last = index;
        break;
      }
    }
    if (last < start) return;
    const left = projection.x(start) - Math.abs(projection.x(1) - projection.x(0)) / 2;
    const right = projection.x(last) + Math.abs(projection.x(1) - projection.x(0)) / 2;
    ctx.fillStyle = region.color;
    ctx.fillRect(left, CHART_PADDING.top, Math.max(0, right - left), height);
  });
}

export function drawMarkers(
  ctx: CanvasRenderingContext2D,
  markers: readonly { index: number; marker: ChartMarker }[],
  projection: Projection,
  palette: ChartPalette,
) {
  markers.forEach(({ index, marker }) => {
    const x = projection.x(index);
    const y = projection.y(marker.value);
    ctx.fillStyle = toneColor(marker.tone, palette);
    ctx.strokeStyle = palette.background;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (marker.tone === "positive") {
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 4.5, y + 3.5);
      ctx.lineTo(x - 4.5, y + 3.5);
    } else if (marker.tone === "negative") {
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x + 4.5, y - 3.5);
      ctx.lineTo(x - 4.5, y - 3.5);
    } else {
      ctx.moveTo(x, y - 4.5);
      ctx.lineTo(x + 4.5, y);
      ctx.lineTo(x, y + 4.5);
      ctx.lineTo(x - 4.5, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  });
}

export function drawLevels(
  ctx: CanvasRenderingContext2D,
  levels: ChartPriceLevel[],
  projection: Projection,
  height: number,
  mode: PriceScaleMode,
  palette: ChartPalette,
) {
  projectPriceLevels({ height, levels, priceScale: mode, range: projection.range, top: CHART_PADDING.top })
    .forEach(({ labelY, level, pinned, trueY }) => {
      const color = toneColor(level.tone, palette);
      ctx.strokeStyle = color;
      ctx.setLineDash(priceLevelDash(level.lineStyle));
      ctx.beginPath();
      ctx.moveTo(pinned ? projection.plotRight - 18 : projection.plotLeft, trueY);
      ctx.lineTo(projection.plotRight, trueY);
      ctx.stroke();
      ctx.setLineDash([]);
      const prefix = pinned === "top" ? "↑ " : pinned === "bottom" ? "↓ " : "";
      const label = `${prefix}${level.label} · ${formatNumber(level.value)}`;
      ctx.font = "10px ui-monospace, monospace";
      const width = ctx.measureText(label).width + 8;
      ctx.fillStyle = palette.background;
      ctx.fillRect(projection.plotLeft + 3, labelY - 7, width, 14);
      ctx.fillStyle = color;
      ctx.fillText(label, projection.plotLeft + 7, labelY + 3);
    });
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: value >= 100 ? 2 : 4 }).format(value);
}
