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

export type WorkspaceAction =
  | { layout: WorkspaceLayout; type: "layout" }
  | { tileId: string; type: "focus" }
  | { leftId: string; rightId: string; type: "swap" }
  | { patch: Partial<Omit<ChartTile, "id">>; tileId: string; type: "update" };

export function createWorkspace(tiles: ChartTile[]): ChartWorkspace {
  if (!tiles.length) throw new RangeError("A chart workspace needs at least one tile.");
  if (new Set(tiles.map((tile) => tile.id)).size !== tiles.length) {
    throw new TypeError("Chart tile ids must be unique.");
  }
  return { focusedTileId: tiles[0].id, layout: "single", tiles, version: 1 };
}

export function reduceWorkspace(
  state: ChartWorkspace,
  action: WorkspaceAction,
): ChartWorkspace {
  if (action.type === "layout") return { ...state, layout: action.layout };
  if (action.type === "focus") {
    return state.tiles.some((tile) => tile.id === action.tileId)
      ? { ...state, focusedTileId: action.tileId }
      : state;
  }
  if (action.type === "update") {
    return {
      ...state,
      tiles: state.tiles.map((tile) => tile.id === action.tileId ? { ...tile, ...action.patch } : tile),
    };
  }
  const left = state.tiles.findIndex((tile) => tile.id === action.leftId);
  const right = state.tiles.findIndex((tile) => tile.id === action.rightId);
  if (left < 0 || right < 0 || left === right) return state;
  const tiles = [...state.tiles];
  [tiles[left], tiles[right]] = [tiles[right], tiles[left]];
  return { ...state, tiles };
}

export function parseWorkspace(value: unknown): ChartWorkspace {
  if (!value || typeof value !== "object") throw new TypeError("Invalid chart workspace.");
  const candidate = value as Partial<ChartWorkspace>;
  if (candidate.version !== 1 || !Array.isArray(candidate.tiles) || !candidate.tiles.length) {
    throw new TypeError("Unsupported chart workspace.");
  }
  const tiles = candidate.tiles.filter(validTile);
  if (tiles.length !== candidate.tiles.length || new Set(tiles.map((tile) => tile.id)).size !== tiles.length) {
    throw new TypeError("Invalid chart tiles.");
  }
  const layout = ["columns", "grid", "rows", "single"].includes(candidate.layout ?? "")
    ? candidate.layout as WorkspaceLayout : "single";
  const focusedTileId = tiles.some((tile) => tile.id === candidate.focusedTileId)
    ? candidate.focusedTileId! : tiles[0].id;
  return { focusedTileId, layout, tiles, version: 1 };
}

function validTile(value: unknown): value is ChartTile {
  if (!value || typeof value !== "object") return false;
  const tile = value as Partial<ChartTile>;
  return typeof tile.id === "string" && tile.id.length > 0 &&
    typeof tile.symbol === "string" && tile.symbol.length > 0 &&
    typeof tile.resolution === "string" &&
    (tile.appearance === "classic" || tile.appearance === "muted") &&
    (tile.priceScale === "linear" || tile.priceScale === "log") &&
    (tile.theme === "dark" || tile.theme === "light") &&
    Array.isArray(tile.indicatorIds) && tile.indicatorIds.every((id) => typeof id === "string");
}
