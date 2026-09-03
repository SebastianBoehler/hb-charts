function buildProfile(bars, bucketCount = 24) {
    const withVolume = bars.filter((bar) => (bar.volume ?? 0) > 0);
    if (!withVolume.length)
        return [];
    const low = Math.min(...withVolume.map((bar) => bar.low));
    const high = Math.max(...withVolume.map((bar) => bar.high));
    if (!(high > low))
        return [];
    const step = (high - low) / bucketCount;
    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
        high: low + (index + 1) * step,
        low: low + index * step,
        volume: 0,
    }));
    withVolume.forEach((bar) => {
        const span = Math.max(bar.high - bar.low, step);
        buckets.forEach((bucket) => {
            const overlap = Math.max(0, Math.min(bar.high, bucket.high) - Math.max(bar.low, bucket.low));
            if (overlap > 0)
                bucket.volume += (bar.volume ?? 0) * (overlap / span);
        });
    });
    return buckets;
}
export function drawVolumeProfile(ctx, bars, plotLeft, plotRight, y, palette) {
    const buckets = buildProfile(bars);
    const maximum = Math.max(...buckets.map((bucket) => bucket.volume), 0);
    if (!maximum)
        return;
    const maximumWidth = (plotRight - plotLeft) * 0.18;
    ctx.fillStyle = `${palette.primary}2e`;
    buckets.forEach((bucket) => {
        const width = (bucket.volume / maximum) * maximumWidth;
        const top = y(bucket.high);
        const bottom = y(bucket.low);
        ctx.fillRect(plotRight - width, top, width, Math.max(1, bottom - top));
    });
}
//# sourceMappingURL=volume-profile.js.map