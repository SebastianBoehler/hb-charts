const OKX_RESOLUTION = {
    "1": "1m", "5": "5m", "15": "15m", "30": "30m", "60": "1H",
    "120": "2H", "240": "4H", "360": "6H", "720": "12H",
};
const BYBIT_RESOLUTION = { "1D": "D", "1M": "M", "1W": "W" };
export function mapOkxResolution(resolution) {
    return OKX_RESOLUTION[resolution] ?? resolution;
}
export function mapBybitResolution(resolution) {
    return BYBIT_RESOLUTION[resolution] ?? resolution;
}
export function normalizeRealtimeTime(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric))
        throw new TypeError("Realtime bar time must be numeric.");
    return numeric > 1_000_000_000_000 ? numeric : numeric * 1_000;
}
//# sourceMappingURL=resolution.js.map