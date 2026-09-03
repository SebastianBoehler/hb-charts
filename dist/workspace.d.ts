import type { CandleAppearance, ChartResolution, ChartTheme, PriceScaleMode } from "./types";
export type WorkspaceLayout = "columns" | "grid" | "rows" | "single";
export interface ChartTile {
    appearance: CandleAppearance;
    id: string;
    indicatorIds: string[];
    priceScale: PriceScaleMode;
    resolution: ChartResolution;
    symbol: string;
    theme: ChartTheme;
}
export interface ChartWorkspace {
    focusedTileId: string;
    layout: WorkspaceLayout;
    tiles: ChartTile[];
    version: 1;
}
export type WorkspaceAction = {
    layout: WorkspaceLayout;
    type: "layout";
} | {
    tileId: string;
    type: "focus";
} | {
    leftId: string;
    rightId: string;
    type: "swap";
} | {
    patch: Partial<Omit<ChartTile, "id">>;
    tileId: string;
    type: "update";
};
export declare function createWorkspace(tiles: ChartTile[]): ChartWorkspace;
export declare function reduceWorkspace(state: ChartWorkspace, action: WorkspaceAction): ChartWorkspace;
export declare function parseWorkspace(value: unknown): ChartWorkspace;
//# sourceMappingURL=workspace.d.ts.map