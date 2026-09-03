import type { ChartPane, ChartPaneLayout } from "./types";
export declare const CHART_PADDING: {
    readonly left: 12;
    readonly right: 62;
    readonly top: 18;
};
export declare const TIME_AXIS_HEIGHT = 28;
export declare function buildPaneLayout(height: number, panes: readonly ChartPane[], collapsed?: ReadonlySet<string>): ChartPaneLayout;
//# sourceMappingURL=layout.d.ts.map