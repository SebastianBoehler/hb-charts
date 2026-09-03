import type { ChartMetrics } from "./types";
export interface CrosshairPoint {
    barIndex: number;
    price: number | null;
    x: number;
    y: number;
}
export declare function inspectChartPoint(metrics: ChartMetrics, x: number, y: number): CrosshairPoint | null;
//# sourceMappingURL=crosshair.d.ts.map