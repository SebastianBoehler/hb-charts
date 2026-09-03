# Interface guide

## Data contract

`ChartBar[]` is ordered oldest-first. `time` is a Unix timestamp in milliseconds;
OHLC values must be finite numbers. `volume` is optional. The renderer throws a
`RangeError` when logarithmic mode receives zero or negative price values.

Every layer must align one-to-one with the full bar array. Use `null` for warm-up
or unavailable values. A layer without `paneId` is projected onto the price pane.
A layer with `paneId` is drawn in the matching `ChartPane`.

## Lifecycle

`createChart(container, options)` owns one canvas and time axis inside `container`.
It observes the container, handles pointer/keyboard interaction, and returns:

- `setData(bars)` to replace the ordered market window.
- `update(options)` to replace layers, panes, theme, scale, or presentation.
- `getViewport()` to read a copy of the current viewport.
- `destroy()` to remove DOM nodes, observers, listeners, and animation frames.

Call `destroy()` when the host surface unmounts. The React adapter does this
automatically.

## Generic layers

Line layers support a fixed color or value-sign coloring. Histogram layers support
fixed, value-sign, and candle-direction coloring. Marker tones and price-level
tones are semantic; the active palette resolves their actual colors.

Private trading state should be translated into these generic values in the host
application. The renderer does not need to understand accounts, positions,
strategies, entitlements, or network routes.

## Realtime adapters

The Bybit and OKX adapters connect only to public market-data WebSockets. They do
not accept credentials or expose private channels. A subscription returns an
unsubscribe function. Historical loading remains the host application's choice.

```ts
import { subscribeBybitBars } from "@hb-capital/charts/providers/bybit";
import { mergeRealtimeBar } from "@hb-capital/charts";

const unsubscribe = subscribeBybitBars({
  listenerId: crypto.randomUUID(),
  resolution: "60",
  symbol: "BTCUSDT",
  onBar: (bar) => chart.setData(mergeRealtimeBar(bars, bar, "60")),
  onStatus: (status) => console.info(status),
});
```

## Accessibility

The framework-free canvas is keyboard focusable and exposes an accessible label.
Hosts should provide an adjacent textual market summary for users who cannot
interpret the visual plot. Use `onCrosshair` to expose inspected OHLC values in
DOM text. Do not use color as the only carrier of trading meaning.

## Extension direction

The first public seam is deliberately data-oriented. Custom line and histogram
layers cover the current reusable workload without exposing internal rendering
objects. Additional primitives should be added only when two real consumers need
them; arbitrary canvas callbacks are intentionally not part of v0.1.0.
