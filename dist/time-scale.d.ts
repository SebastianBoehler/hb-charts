import type { ChartViewport } from "./types";
export declare const DEFAULT_VISIBLE_BARS = 160;
export declare const MIN_VISIBLE_BARS = 30;
export declare function panTimeViewport(viewport: ChartViewport, barCount: number, delta: number): ChartViewport;
export declare function scaleTimeViewport(viewport: ChartViewport, barCount: number, requestedVisibleBars: number, anchorRatio?: number): ChartViewport;
export declare function latestRightPaddingBars(visibleBars: number, rightOffset: number): number;
export declare function timeAxisAnchorRatio(pointerX: number, plotLeft: number, dataRight: number): number;
//# sourceMappingURL=time-scale.d.ts.map