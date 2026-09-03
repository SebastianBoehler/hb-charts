import type { CandlePalette, ChartPalette } from "../palette";
import type { ChartBar, ChartLayer, ChartPane, ChartPaneLayout } from "../types";
interface PaneDrawOptions {
    bars: readonly ChartBar[];
    candles: CandlePalette;
    ctx: CanvasRenderingContext2D;
    layers: readonly ChartLayer[];
    layout: ChartPaneLayout;
    left: number;
    palette: ChartPalette;
    panes: readonly ChartPane[];
    width: number;
    x: (index: number) => number;
}
export declare function drawPanes(options: PaneDrawOptions): void;
export {};
//# sourceMappingURL=panes.d.ts.map