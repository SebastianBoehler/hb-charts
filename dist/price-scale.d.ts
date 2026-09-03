import type { ChartPriceRange, PriceScaleMode } from "./types";
export declare const DEFAULT_PRICE_SCALE: PriceScaleMode;
export declare function parsePriceScale(value: unknown): PriceScaleMode;
export declare function isPriceScaleAvailable(values: readonly number[], priceScale: PriceScaleMode): boolean;
export declare function normalizePriceRange(min: number, max: number, paddingRatio?: number, mode?: PriceScaleMode): ChartPriceRange;
export declare function priceRangeForValues(values: number[], mode?: PriceScaleMode): ChartPriceRange;
export declare function priceAtY(range: ChartPriceRange, y: number, top: number, height: number, mode?: PriceScaleMode): number;
export declare function yForPrice(range: ChartPriceRange, value: number, top: number, height: number, mode?: PriceScaleMode): number;
export declare function scalePriceRange(range: ChartPriceRange, anchor: number, factor: number, mode?: PriceScaleMode): {
    max: number;
    min: number;
};
export declare function shiftPriceRange(range: ChartPriceRange, deltaRatio: number): {
    max: number;
    min: number;
};
//# sourceMappingURL=price-scale.d.ts.map