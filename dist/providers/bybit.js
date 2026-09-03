import { mapBybitResolution, normalizeRealtimeTime } from "./resolution";
import { createRealtimeTransport } from "./transport";
const ENDPOINT = "wss://stream.bybit.com/v5/public/linear";
function record(value) {
    return typeof value === "object" && value !== null ? value : null;
}
export function bybitKlineTopic(symbol, resolution) {
    return `kline.${mapBybitResolution(resolution)}.${symbol}`;
}
export function parseBybitKlineMessage(message) {
    const payload = record(message);
    if (!payload || !Array.isArray(payload.data))
        return [];
    return payload.data.flatMap((value) => {
        const bar = record(value);
        if (!bar)
            return [];
        try {
            return [{
                    close: Number(bar.close),
                    high: Number(bar.high),
                    low: Number(bar.low),
                    open: Number(bar.open),
                    time: normalizeRealtimeTime(bar.start ?? bar.startTime ?? bar.t ?? bar.ts),
                    volume: bar.volume === undefined ? undefined : Number(bar.volume),
                }];
        }
        catch {
            return [];
        }
    });
}
const transport = createRealtimeTransport({
    endpoint: ENDPOINT,
    heartbeat: { intervalMs: 20_000, message: JSON.stringify({ op: "ping" }) },
    messageKey: (message) => {
        const payload = record(message);
        return typeof payload?.topic === "string" ? payload.topic : null;
    },
    subscribeMessage: (keys) => JSON.stringify({ args: keys, op: "subscribe" }),
    unsubscribeMessage: (keys) => JSON.stringify({ args: keys, op: "unsubscribe" }),
});
export function subscribeBybitBars(options) {
    transport.subscribe({
        key: bybitKlineTopic(options.symbol, options.resolution),
        listenerId: options.listenerId,
        onMessage: (message) => parseBybitKlineMessage(message).forEach(options.onBar),
        onStatus: options.onStatus,
    });
    return () => transport.unsubscribe(options.listenerId);
}
//# sourceMappingURL=bybit.js.map