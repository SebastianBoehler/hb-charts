import type { ChartPriceLevel, ChartPriceRange, PriceScaleMode } from "./types";
export interface ProjectedPriceLevel {
    labelY: number;
    level: ChartPriceLevel;
    pinned: "bottom" | "top" | null;
    trueY: number;
}
export declare function projectPriceLevels({ height, levels, priceScale, range, top, }: {
    height: number;
    levels: ChartPriceLevel[];
    priceScale: PriceScaleMode;
    range: ChartPriceRange;
    top: number;
}): ProjectedPriceLevel[];
export declare function priceLevelDash(style: ChartPriceLevel["lineStyle"]): number[];
//# sourceMappingURL=price-levels.d.ts.map