import { yForPrice } from "./price-scale";
import type { ChartPriceLevel, ChartPriceRange, PriceScaleMode } from "./types";

export interface ProjectedPriceLevel {
  labelY: number;
  level: ChartPriceLevel;
  pinned: "bottom" | "top" | null;
  trueY: number;
}

export function projectPriceLevels({
  height,
  levels,
  priceScale,
  range,
  top,
}: {
  height: number;
  levels: ChartPriceLevel[];
  priceScale: PriceScaleMode;
  range: ChartPriceRange;
  top: number;
}): ProjectedPriceLevel[] {
  const bottom = top + height;
  const sorted = levels
    .filter((level) => Number.isFinite(level.value) && level.value > 0)
    .map((level) => {
      const pinned: ProjectedPriceLevel["pinned"] =
        level.value > range.max
          ? "top"
          : level.value < range.min
            ? "bottom"
            : null;
      return {
        level,
        pinned,
        trueY: pinned === "top" ? top : pinned === "bottom" ? bottom : yForPrice(range, level.value, top, height, priceScale),
      };
    })
    .sort((left, right) => left.trueY - right.trueY);
  const gap = sorted.length > 1 ? Math.min(15, Math.max(1, height / (sorted.length - 1))) : 15;
  let previous = top + 8 - gap;
  const packed = sorted.map((entry) => {
    const labelY = Math.max(top + 8, Math.min(bottom - 8, Math.max(entry.trueY, previous + gap)));
    previous = labelY;
    return { ...entry, labelY };
  });
  for (let index = packed.length - 2; index >= 0; index -= 1) {
    packed[index].labelY = Math.min(packed[index].labelY, packed[index + 1].labelY - gap);
  }
  return packed;
}

export function priceLevelDash(style: ChartPriceLevel["lineStyle"]) {
  return style === "solid" ? [] : style === "dotted" ? [2, 3] : [6, 4];
}
