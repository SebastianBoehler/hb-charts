export function createWorkspace(tiles) {
    if (!tiles.length)
        throw new RangeError("A chart workspace needs at least one tile.");
    if (new Set(tiles.map((tile) => tile.id)).size !== tiles.length) {
        throw new TypeError("Chart tile ids must be unique.");
    }
    return { focusedTileId: tiles[0].id, layout: "single", tiles, version: 1 };
}
export function reduceWorkspace(state, action) {
    if (action.type === "layout")
        return { ...state, layout: action.layout };
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
    if (left < 0 || right < 0 || left === right)
        return state;
    const tiles = [...state.tiles];
    [tiles[left], tiles[right]] = [tiles[right], tiles[left]];
    return { ...state, tiles };
}
export function parseWorkspace(value) {
    if (!value || typeof value !== "object")
        throw new TypeError("Invalid chart workspace.");
    const candidate = value;
    if (candidate.version !== 1 || !Array.isArray(candidate.tiles) || !candidate.tiles.length) {
        throw new TypeError("Unsupported chart workspace.");
    }
    const tiles = candidate.tiles.filter(validTile);
    if (tiles.length !== candidate.tiles.length || new Set(tiles.map((tile) => tile.id)).size !== tiles.length) {
        throw new TypeError("Invalid chart tiles.");
    }
    const layout = ["columns", "grid", "rows", "single"].includes(candidate.layout ?? "")
        ? candidate.layout : "single";
    const focusedTileId = tiles.some((tile) => tile.id === candidate.focusedTileId)
        ? candidate.focusedTileId : tiles[0].id;
    return { focusedTileId, layout, tiles, version: 1 };
}
function validTile(value) {
    if (!value || typeof value !== "object")
        return false;
    const tile = value;
    return typeof tile.id === "string" && tile.id.length > 0 &&
        typeof tile.symbol === "string" && tile.symbol.length > 0 &&
        typeof tile.resolution === "string" &&
        (tile.appearance === "classic" || tile.appearance === "muted") &&
        (tile.priceScale === "linear" || tile.priceScale === "log") &&
        (tile.theme === "dark" || tile.theme === "light") &&
        Array.isArray(tile.indicatorIds) && tile.indicatorIds.every((id) => typeof id === "string");
}
//# sourceMappingURL=workspace.js.map