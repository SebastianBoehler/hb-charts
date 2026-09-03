import type { ChartBar, ChartResolution } from "./types";
export declare function barBucketStart(time: number, resolution: ChartResolution): number;
export declare function mergeRealtimeBar(bars: ChartBar[], realtimeBar: ChartBar, resolution: ChartResolution, maxBars?: number): ChartBar[];
export declare function mergeHistoryBars(historicalBars: ChartBar[], currentBars: ChartBar[], maxBars?: number): ChartBar[];
//# sourceMappingURL=live-bars.d.ts.map