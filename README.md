# HB Charts

Native Canvas2D financial charts for research interfaces.

HB Charts is the open-source renderer behind the market charts at
[HB Capital](https://www.hb-capital.app/charts). It focuses on a small interface
for ordered OHLCV bars, generic price and pane layers, markers, price levels,
themes, and viewport interaction. The renderer does not require React; a React
adapter and public Bybit/OKX realtime adapters are included.

> **GitHub source release v0.1.2:** HB Charts is not published to npm yet. Clone
> the repository or install the pinned GitHub tag. Compiled ESM and declarations
> are included, so the package does not run an install script.

## Install from GitHub

```bash
bun add github:SebastianBoehler/hb-charts#v0.1.2
```

Or clone and build it directly:

```bash
git clone https://github.com/SebastianBoehler/hb-charts.git
cd hb-charts
bun install
bun run check
```

## Framework-free chart

```ts
import {
  buildStandardIndicators,
  createChart,
  type ChartBar,
} from "@hb-capital/charts";

const bars: ChartBar[] = await loadYourBars();
const indicators = buildStandardIndicators(bars, ["ema", "volume", "rsi"]);

const chart = createChart(document.querySelector("#chart")!, {
  bars,
  layers: indicators.layers,
  panes: indicators.panes,
  theme: "dark",
});

// Later:
chart.setData(nextBars);
chart.destroy();
```

The container controls the chart size. Give it an explicit height or min-height.
Bars must be oldest-first and use Unix timestamps in milliseconds.

## React adapter

```tsx
import { Chart } from "@hb-capital/charts/react";
import { buildStandardIndicators } from "@hb-capital/charts";

const indicators = buildStandardIndicators(bars, ["ema", "macd", "volume"]);

export function MarketChart() {
  return (
    <Chart
      ariaLabel="BTC perpetual hourly chart"
      bars={bars}
      layers={indicators.layers}
      panes={indicators.panes}
      style={{ height: 560 }}
      theme="dark"
    />
  );
}
```

## Custom layers

Layers are data, not product state. A price overlay omits `paneId`; a study layer
targets a named pane.

```ts
const layers = [
  {
    id: "fair-value",
    kind: "line" as const,
    label: "Fair value",
    values: fairValueSeries,
    color: "#e8b86d",
    lineWidth: 1.4,
  },
  {
    id: "signed-flow",
    kind: "histogram" as const,
    paneId: "flow",
    values: signedFlowSeries,
    colorMode: "value-sign" as const,
  },
];

const panes = [{ id: "flow", label: "Signed flow", referenceLevels: [0] }];
```

See [the interface guide](docs/interface.md) for invariants, lifecycle, errors,
providers, browser support, and extension points.

## What is public

- Canvas2D candlestick renderer and generic layers
- Linear and logarithmic price scales
- Pan, zoom, keyboard navigation, crosshair inspection, and time ticks
- Collapsible subordinate panes, markers, price levels, and time regions
- EMA, SMA, VWAP, Bollinger Bands, RSI, MACD, ATR, stochastic, and volume
- Versioned multi-chart workspace state
- Public Bybit and OKX kline WebSocket adapters
- Framework-free and React interfaces

HB Capital account data, execution controls, proprietary research studies, and
model artifacts are intentionally not part of this repository.

## Development

```bash
bun install
bun run playground
bun run check
```

The playground loads real public Bybit BTCUSDT candles; it does not use mock
market data. Exchange availability and rate limits therefore affect the example.

## Browser and performance scope

The first release targets current evergreen browsers with Canvas2D,
`ResizeObserver`, Pointer Events, and WebSocket support. HB Charts is designed for
bounded research windows, not tick-level millions-of-points rendering. No claim is
made that Canvas2D is faster than WebGL chart engines; publish benchmarks before
making workload-specific performance comparisons.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). The license does not grant
permission to use HB Capital trademarks except for customary attribution.
