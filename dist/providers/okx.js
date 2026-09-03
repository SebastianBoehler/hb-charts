import { mapOkxResolution, normalizeRealtimeTime } from "./resolution";
import { createRealtimeTransport } from "./transport";
const ENDPOINT = "wss://ws.okx.com:8443/ws/v5/business";
function record(value) {
    return typeof value === "object" && value !== null ? value : null;
}
export function okxKlineChannel(resolution) {
    return `mark-price-candle${mapOkxResolution(resolution)}`;
}
function subscription(key) {
    const [channel, instId] = key.split("|");
    return channel && instId ? { channel, instId } : null;
}
export function parseOkxKlineMessage(message) {
    const payload = record(message);
    if (!payload || !Array.isArray(payload.data))
        return [];
    return payload.data.flatMap((value) => {
        if (!Array.isArray(value))
            return [];
        const [time, open, high, low, close, , volume] = value;
        try {
            return [{
                    close: Number(close), high: Number(high), low: Number(low), open: Number(open),
                    time: normalizeRealtimeTime(time),
                    volume: volume === undefined ? undefined : Number(volume),
                }];
        }
        catch {
            return [];
        }
    });
}
const transport = createRealtimeTransport({
    endpoint: ENDPOINT,
    heartbeat: { intervalMs: 25_000, message: "ping" },
    messageKey: (message) => {
        const arg = record(record(message)?.arg);
        return typeof arg?.channel === "string" && typeof arg.instId === "string"
            ? `${arg.channel}|${arg.instId}` : null;
    },
    subscribeMessage: (keys) => JSON.stringify({ args: keys.flatMap((key) => subscription(key) ?? []), op: "subscribe" }),
    unsubscribeMessage: (keys) => JSON.stringify({ args: keys.flatMap((key) => subscription(key) ?? []), op: "unsubscribe" }),
});
export function subscribeOkxBars(options) {
    const channel = okxKlineChannel(options.resolution);
    transport.subscribe({
        key: `${channel}|${options.symbol}`,
        listenerId: options.listenerId,
        onMessage: (message) => parseOkxKlineMessage(message).forEach(options.onBar),
        onStatus: options.onStatus,
    });
    return () => transport.unsubscribe(options.listenerId);
}
//# sourceMappingURL=okx.js.map