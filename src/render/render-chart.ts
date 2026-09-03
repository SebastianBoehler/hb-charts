import { containingBarIndex } from "../geometry";
import { CHART_PADDING } from "../layout";
import { candlePalette, chartPalettes } from "../palette";
import { isPriceScaleAvailable, priceRangeForValues, yForPrice } from "../price-scale";
import { latestRightPaddingBars } from "../time-scale";
import type { ChartLayer, ChartMetrics, DrawChartOptions } from "../types";
import { drawCandles, drawGrid, drawLevels, drawLine, drawMarkers, drawRegions } from "./primitives";
import { drawPanes } from "./panes";
import { drawVolumeProfile } from "./volume-profile";

function slicedLayer(layer: ChartLayer, start: number, end: number): ChartLayer {
  return { ...layer, values: layer.values.slice(start, end) };
}

export function drawChart(
  canvas: HTMLCanvasElement,
  options: DrawChartOptions,
): ChartMetrics | null {
  const theme = options.theme ?? "dark";
  const mode = options.priceScale ?? "linear";
  const priceValues = options.bars.flatMap((bar) => [bar.open, bar.high, bar.low, bar.close]);
  if (!isPriceScaleAvailable(priceValues, mode)) {
    throw new RangeError("Log unavailable for zero or negative values.");
  }
  const bounds = canvas.getBoundingClientRect();
  const end = Math.max(0, options.bars.length - options.viewport.rightOffset);
  const start = Math.max(0, end - options.viewport.visibleBars);
  const bars = options.bars.slice(start, end);
  if (!bars.length || bounds.width <= 0 || bounds.height <= 0) return null;

  const ratio = window.devicePixelRatio || 1;
  const pixelWidth = Math.max(1, Math.round(bounds.width * ratio));
  const pixelHeight = Math.max(1, Math.round(bounds.height * ratio));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const palette = chartPalettes[theme];
  const candles = candlePalette(theme, options.candleAppearance ?? "muted");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, bounds.width, bounds.height);

  const layers = (options.layers ?? []).map((layer) => slicedLayer(layer, start, end));
  const priceLayers = layers.filter((layer) => !layer.paneId);
  const priceHeight = options.paneLayout?.priceHeight ?? Math.max(0, bounds.height - 60);
  const values = [
    ...bars.flatMap((bar) => [bar.low, bar.high]),
    ...priceLayers.flatMap((layer) => layer.values),
  ].filter((value): value is number => value !== null && Number.isFinite(value) && (mode === "linear" || value > 0));
  const range = options.viewport.priceRange ?? priceRangeForValues(values, mode);
  const width = bounds.width - CHART_PADDING.left - CHART_PADDING.right;
  const rightPadding = latestRightPaddingBars(bars.length, options.viewport.rightOffset);
  const slots = Math.max(1, bars.length - 1 + rightPadding);
  const x = (index: number) => CHART_PADDING.left + (index / slots) * width;
  const y = (value: number) => yForPrice(range, value, CHART_PADDING.top, priceHeight, mode);
  const projection = {
    dataRight: x(bars.length - 1),
    plotLeft: CHART_PADDING.left,
    plotRight: bounds.width - CHART_PADDING.right,
    range,
    x,
    y,
  };

  drawRegions(ctx, options.regions ?? [], bars, projection, priceHeight);
  drawGrid(ctx, bounds.width, priceHeight, range, mode, palette, ratio);
  ctx.save();
  ctx.beginPath();
  ctx.rect(CHART_PADDING.left, CHART_PADDING.top, width, priceHeight);
  ctx.clip();
  if (options.showVolumeProfile) {
    drawVolumeProfile(ctx, bars, projection.plotLeft, projection.plotRight, y, palette);
  }
  drawCandles(ctx, bars, projection, candles, ratio);
  priceLayers.forEach((layer) => {
    if (layer.kind === "line") drawLine(ctx, layer, x, y, palette);
  });
  const markers = (options.markers ?? []).flatMap((marker) => {
    const index = containingBarIndex(options.bars, marker.time);
    return index >= start && index < end ? [{ index: index - start, marker }] : [];
  }).filter(({ marker }) => mode === "linear" || marker.value > 0);
  drawMarkers(ctx, markers, projection, palette);
  ctx.restore();
  drawLevels(ctx, options.priceLevels ?? [], projection, priceHeight, mode, palette);

  if (options.paneLayout) {
    drawPanes({
      bars,
      candles,
      ctx,
      layers,
      layout: options.paneLayout,
      left: CHART_PADDING.left,
      palette,
      panes: options.panes ?? [],
      width,
      x,
    });
  }
  return {
    dataRight: projection.dataRight,
    end,
    plotLeft: projection.plotLeft,
    plotRight: projection.plotRight,
    priceHeight,
    priceRange: range,
    priceScale: mode,
    priceTop: CHART_PADDING.top,
    start,
  };
}
