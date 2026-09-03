import { type CandlePalette, type ChartPalette } from "../palette";
import type { ChartBar, ChartHistogramLayer, ChartLineLayer, ChartMarker, ChartPriceLevel, ChartPriceRange, ChartTimeRegion, PriceScaleMode } from "../types";
export interface Projection {
    dataRight: number;
    plotLeft: number;
    plotRight: number;
    range: ChartPriceRange;
    x: (index: number) => number;
    y: (value: number) => number;
}
export declare function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, range: ChartPriceRange, mode: PriceScaleMode, palette: ChartPalette, ratio: number): void;
export declare function drawCandles(ctx: CanvasRenderingContext2D, bars: readonly ChartBar[], projection: Projection, candles: CandlePalette, ratio: number): void;
export declare function drawLine(ctx: CanvasRenderingContext2D, layer: ChartLineLayer, x: (index: number) => number, y: (value: number) => number, palette: ChartPalette): void;
export declare function drawHistogram(ctx: CanvasRenderingContext2D, layer: ChartHistogramLayer, bars: readonly ChartBar[], x: (index: number) => number, y: (value: number) => number, baseline: number, palette: ChartPalette, candles: CandlePalette): void;
export declare function drawRegions(ctx: CanvasRenderingContext2D, regions: readonly ChartTimeRegion[], bars: readonly ChartBar[], projection: Projection, height: number): void;
export declare function drawMarkers(ctx: CanvasRenderingContext2D, markers: readonly {
    index: number;
    marker: ChartMarker;
}[], projection: Projection, palette: ChartPalette): void;
export declare function drawLevels(ctx: CanvasRenderingContext2D, levels: ChartPriceLevel[], projection: Projection, height: number, mode: PriceScaleMode, palette: ChartPalette): void;
export declare function formatNumber(value: number): string;
//# sourceMappingURL=primitives.d.ts.map