import { atr, bollinger, ema, macd, rsi, sma, stochastic, vwap } from "./indicator-math";
export function buildStandardIndicators(bars, active) {
    const ids = new Set(active);
    const closes = bars.map((bar) => bar.close);
    const layers = [];
    const panes = [];
    if (ids.has("ema")) {
        layers.push({ id: "ema-12", kind: "line", label: "EMA 12", values: ema(closes, 12) }, { id: "ema-48", kind: "line", label: "EMA 48", values: ema(closes, 48) });
    }
    if (ids.has("sma")) {
        layers.push({ id: "sma-20", kind: "line", label: "SMA 20", values: sma(closes, 20) });
    }
    if (ids.has("vwap")) {
        layers.push({ id: "vwap", kind: "line", label: "VWAP", values: vwap(bars) });
    }
    if (ids.has("bollinger")) {
        const bands = bollinger(closes);
        layers.push({ id: "bollinger-upper", kind: "line", label: "Bollinger upper", values: bands.upper }, { id: "bollinger-middle", kind: "line", label: "Bollinger middle", values: bands.middle }, { id: "bollinger-lower", kind: "line", label: "Bollinger lower", values: bands.lower });
    }
    if (ids.has("volume")) {
        panes.push({ id: "volume", label: "Volume" });
        layers.push({
            colorMode: "bar-direction",
            id: "volume",
            kind: "histogram",
            paneId: "volume",
            values: bars.map((bar) => bar.volume ?? null),
        });
    }
    if (ids.has("rsi")) {
        panes.push({ fixedRange: [0, 100], id: "rsi", label: "RSI 14", referenceLevels: [30, 50, 70] });
        layers.push({ id: "rsi", kind: "line", paneId: "rsi", values: rsi(closes, 14) });
    }
    if (ids.has("stochastic")) {
        panes.push({ fixedRange: [0, 100], id: "stochastic", label: "Stochastic 14", referenceLevels: [20, 80] });
        layers.push({ id: "stochastic", kind: "line", paneId: "stochastic", values: stochastic(bars, 14) });
    }
    if (ids.has("atr")) {
        panes.push({ id: "atr", label: "ATR 14" });
        layers.push({ id: "atr", kind: "line", paneId: "atr", values: atr(bars, 14) });
    }
    if (ids.has("macd")) {
        const values = macd(closes);
        panes.push({ id: "macd", label: "MACD" });
        layers.push({ id: "macd-line", kind: "line", paneId: "macd", values: values.line }, { id: "macd-signal", kind: "line", paneId: "macd", values: values.signal }, { colorMode: "value-sign", id: "macd-histogram", kind: "histogram", paneId: "macd", values: values.histogram });
    }
    return { layers, panes };
}
//# sourceMappingURL=indicators.js.map