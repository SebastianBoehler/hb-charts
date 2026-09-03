import { describe, expect, test } from "bun:test";
import { createWorkspace, parseWorkspace, reduceWorkspace, type ChartTile } from "./workspace";

function tile(id: string): ChartTile {
  return {
    appearance: "muted",
    id,
    indicatorIds: ["ema"],
    priceScale: "linear",
    resolution: "60",
    symbol: "BTCUSDT",
    theme: "dark",
  };
}

describe("workspace", () => {
  test("requires unique tiles", () => {
    expect(() => createWorkspace([])).toThrow();
    expect(() => createWorkspace([tile("a"), tile("a")])).toThrow();
  });

  test("updates and swaps complete tiles", () => {
    let state = createWorkspace([tile("a"), tile("b")]);
    state = reduceWorkspace(state, { patch: { symbol: "ETHUSDT" }, tileId: "a", type: "update" });
    expect(state.tiles[0].symbol).toBe("ETHUSDT");
    state = reduceWorkspace(state, { leftId: "a", rightId: "b", type: "swap" });
    expect(state.tiles.map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  test("parses a versioned public workspace", () => {
    const state = createWorkspace([tile("a")]);
    expect(parseWorkspace(JSON.parse(JSON.stringify(state)))).toEqual(state);
    expect(() => parseWorkspace({ version: 2, tiles: [] })).toThrow();
  });
});
