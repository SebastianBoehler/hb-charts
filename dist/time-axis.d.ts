import type { ChartBar } from "./types";
export interface TimeAxisTick {
    align: "center" | "end" | "start";
    index: number;
    label: string;
    offset: number;
}
export declare function formatTimeAxisLabel(timestamp: number, visibleSpan: number): string;
export declare function buildTimeAxisTicks({ bars, dataWidth, end, start, }: {
    bars: readonly ChartBar[];
    dataWidth: number;
    end: number;
    start: number;
}): TimeAxisTick[];
//# sourceMappingURL=time-axis.d.ts.map