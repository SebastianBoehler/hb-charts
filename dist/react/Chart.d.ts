import { type CSSProperties } from "react";
import type { CreateChartOptions } from "../types";
export interface ChartProps extends CreateChartOptions {
    className?: string;
    style?: CSSProperties;
}
export declare function Chart({ className, style, ...options }: ChartProps): import("react").JSX.Element;
//# sourceMappingURL=Chart.d.ts.map