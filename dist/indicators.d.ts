import type { ChartBar, ChartLayer, ChartPane } from "./types";
export type StandardIndicatorId = "atr" | "bollinger" | "ema" | "macd" | "rsi" | "sma" | "stochastic" | "volume" | "vwap";
export interface StandardIndicatorResult {
    layers: ChartLayer[];
    panes: ChartPane[];
}
export declare function buildStandardIndicators(bars: readonly ChartBar[], active: readonly StandardIndicatorId[]): StandardIndicatorResult;
//# sourceMappingURL=indicators.d.ts.map