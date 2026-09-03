import { buildStandardIndicators, createChart, mergeRealtimeBar, type ChartBar } from "../src";
import { subscribeBybitBars } from "../src/providers/bybit";

const status = document.querySelector<HTMLSpanElement>("#status")!;
const container = document.querySelector<HTMLElement>("#chart")!;

interface BybitKlineResponse {
  result?: { list?: string[][] };
  retCode?: number;
  retMsg?: string;
}

async function loadHistory() {
  const response = await fetch(
    "https://api.bybit.com/v5/market/kline?category=linear&symbol=BTCUSDT&interval=60&limit=500",
  );
  if (!response.ok) throw new Error(`Bybit history returned HTTP ${response.status}.`);
  const payload = await response.json() as BybitKlineResponse;
  if (payload.retCode !== 0 || !payload.result?.list) {
    throw new Error(payload.retMsg || "Bybit history did not contain candles.");
  }
  return payload.result.list.map(([time, open, high, low, close, volume]) => ({
    close: Number(close), high: Number(high), low: Number(low), open: Number(open),
    time: Number(time), volume: Number(volume),
  })).sort((left, right) => left.time - right.time) satisfies ChartBar[];
}

try {
  let bars: ChartBar[] = await loadHistory();
  const indicators = () => buildStandardIndicators(bars, ["ema", "volume", "rsi"]);
  const initial = indicators();
  const chart = createChart(container, {
    ariaLabel: "BTCUSDT hourly candlestick chart",
    bars,
    candleAppearance: "classic",
    layers: initial.layers,
    panes: initial.panes,
    theme: "dark",
  });
  status.textContent = "Connecting to Bybit realtime…";
  subscribeBybitBars({
    listenerId: "playground-btcusdt-60",
    onBar: (bar) => {
      bars = mergeRealtimeBar(bars, bar, "60");
      const next = indicators();
      chart.update({ bars, layers: next.layers, panes: next.panes });
      status.textContent = "Bybit · live";
    },
    onStatus: (connection) => { status.textContent = `Bybit · ${connection}`; },
    resolution: "60",
    symbol: "BTCUSDT",
  });
} catch (error) {
  status.dataset.error = "true";
  status.textContent = error instanceof Error ? error.message : "Public market data failed to load.";
}
