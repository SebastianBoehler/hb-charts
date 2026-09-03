import type { ChartBar, NumericSeries } from "./types";
export declare function ema(values: readonly number[], length: number): NumericSeries;
export declare function sma(values: readonly number[], length: number): NumericSeries;
export declare function atr(bars: readonly ChartBar[], length: number): NumericSeries;
export declare function rsi(values: readonly number[], length: number): NumericSeries;
export declare function stochastic(bars: readonly ChartBar[], length: number): NumericSeries;
export declare function vwap(bars: readonly ChartBar[]): NumericSeries;
export declare function bollinger(values: readonly number[], length?: number, multiplier?: number): {
    lower: NumericSeries;
    middle: NumericSeries;
    upper: NumericSeries;
};
export declare function macd(values: readonly number[], fast?: number, slow?: number, signal?: number): {
    histogram: number[];
    line: number[];
    signal: NumericSeries;
};
//# sourceMappingURL=indicator-math.d.ts.map