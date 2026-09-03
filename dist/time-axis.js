const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function pad(value) {
    return value.toString().padStart(2, "0");
}
export function formatTimeAxisLabel(timestamp, visibleSpan) {
    const date = new Date(timestamp);
    const day = pad(date.getUTCDate());
    const month = MONTHS[date.getUTCMonth()];
    if (visibleSpan <= 3 * 24 * 60 * 60 * 1_000) {
        return `${day}\u00a0${month} · ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
    }
    if (visibleSpan <= 120 * 24 * 60 * 60 * 1_000)
        return `${day}\u00a0${month}`;
    return `${month}\u00a0${date.getUTCFullYear()}`;
}
export function buildTimeAxisTicks({ bars, dataWidth, end, start, }) {
    const first = Math.max(0, Math.min(bars.length - 1, start));
    const last = Math.max(first, Math.min(bars.length - 1, end - 1));
    const count = last - first + 1;
    if (!bars.length || count <= 0 || dataWidth <= 0)
        return [];
    const span = Math.max(0, bars[last].time - bars[first].time);
    if (count === 1 || dataWidth < 148) {
        return [{
                align: "end",
                index: last,
                label: formatTimeAxisLabel(bars[last].time, span),
                offset: dataWidth,
            }];
    }
    const segments = Math.max(1, Math.min(count - 1, Math.floor(dataWidth / 88)));
    const indices = Array.from({ length: segments + 1 }, (_, position) => Math.round(first + ((last - first) * position) / segments)).filter((index, position, values) => index !== values[position - 1]);
    return indices.map((index, position) => ({
        align: position === 0 ? "start" : position === indices.length - 1 ? "end" : "center",
        index,
        label: formatTimeAxisLabel(bars[index].time, span),
        offset: ((index - first) / Math.max(1, last - first)) * dataWidth,
    }));
}
//# sourceMappingURL=time-axis.js.map