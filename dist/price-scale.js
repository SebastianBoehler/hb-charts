const MIN_SPAN = 1e-8;
const MAX_SPAN = 1e15;
const MIN_SCALE_FACTOR = 0.05;
const MAX_SCALE_FACTOR = 20;
const MIN_LOG_VALUE = Math.log(Number.MIN_VALUE);
const MAX_LOG_VALUE = Math.log(Number.MAX_VALUE);
export const DEFAULT_PRICE_SCALE = "linear";
export function parsePriceScale(value) {
    return value === "log" ? "log" : DEFAULT_PRICE_SCALE;
}
export function isPriceScaleAvailable(values, priceScale) {
    return (priceScale === "linear" ||
        values.every((value) => Number.isFinite(value) && value > 0));
}
function logValue(value) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new RangeError("Log price scale requires finite, strictly positive values.");
    }
    return Math.log(value);
}
function transformedRange(range, mode) {
    if (mode === "linear")
        return range;
    if (range.max < range.min) {
        throw new RangeError("Log price scale requires an ordered price range.");
    }
    return { max: logValue(range.max), min: logValue(range.min) };
}
function rawRange(min, max, mode) {
    if (mode === "linear")
        return { max, min };
    const representableSpan = MAX_LOG_VALUE - MIN_LOG_VALUE;
    const span = max - min;
    if (!Number.isFinite(span) || span < 0) {
        throw new RangeError("Log price scale requires an ordered finite range.");
    }
    let boundedMin = min;
    let boundedMax = max;
    if (span >= representableSpan) {
        boundedMin = MIN_LOG_VALUE;
        boundedMax = MAX_LOG_VALUE;
    }
    else if (boundedMax > MAX_LOG_VALUE) {
        boundedMin -= boundedMax - MAX_LOG_VALUE;
        boundedMax = MAX_LOG_VALUE;
    }
    else if (boundedMin < MIN_LOG_VALUE) {
        boundedMax += MIN_LOG_VALUE - boundedMin;
        boundedMin = MIN_LOG_VALUE;
    }
    return {
        max: Math.exp(Math.min(boundedMax, MAX_LOG_VALUE)),
        min: Math.exp(Math.max(boundedMin, MIN_LOG_VALUE)),
    };
}
export function normalizePriceRange(min, max, paddingRatio = 0.04, mode = DEFAULT_PRICE_SCALE) {
    if (mode === "log") {
        const transformed = transformedRange({ max, min }, mode);
        const normalized = normalizePriceRange(transformed.min, transformed.max, paddingRatio);
        return rawRange(normalized.min, normalized.max, mode);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max))
        return { max: 1, min: 0 };
    const rawSpan = Math.max(max - min, Math.abs(max) * 1e-6, MIN_SPAN);
    const padding = rawSpan * Math.max(0, paddingRatio);
    return { max: max + padding, min: min - padding };
}
export function priceRangeForValues(values, mode = DEFAULT_PRICE_SCALE) {
    const finite = values.filter(Number.isFinite);
    if (!finite.length) {
        return mode === "log"
            ? normalizePriceRange(1, 1, 0.04, mode)
            : normalizePriceRange(Number.NaN, Number.NaN);
    }
    return normalizePriceRange(Math.min(...finite), Math.max(...finite), 0.04, mode);
}
export function priceAtY(range, y, top, height, mode = DEFAULT_PRICE_SCALE) {
    const ratio = 1 - Math.max(0, Math.min(1, (y - top) / Math.max(height, 1)));
    const transformed = transformedRange(range, mode);
    const projected = transformed.min + ratio * (transformed.max - transformed.min);
    return mode === "log" ? Math.exp(projected) : projected;
}
export function yForPrice(range, value, top, height, mode = DEFAULT_PRICE_SCALE) {
    const transformed = transformedRange(range, mode);
    const projected = mode === "log" ? logValue(value) : value;
    const span = Math.max(transformed.max - transformed.min, MIN_SPAN);
    return top + (1 - (projected - transformed.min) / span) * height;
}
export function scalePriceRange(range, anchor, factor, mode = DEFAULT_PRICE_SCALE) {
    const transformed = transformedRange(range, mode);
    const projectedAnchor = mode === "log" ? logValue(anchor) : anchor;
    const currentSpan = Math.max(transformed.max - transformed.min, MIN_SPAN);
    const maximumSpan = mode === "log" ? Math.log(MAX_SPAN) : MAX_SPAN;
    const nextSpan = Math.max(MIN_SPAN, Math.min(maximumSpan, currentSpan * Math.max(MIN_SCALE_FACTOR, Math.min(MAX_SCALE_FACTOR, factor))));
    const anchorRatio = Math.max(0, Math.min(1, (projectedAnchor - transformed.min) / currentSpan));
    const min = projectedAnchor - anchorRatio * nextSpan;
    return rawRange(min, min + nextSpan, mode);
}
export function shiftPriceRange(range, deltaRatio) {
    const delta = (range.max - range.min) * deltaRatio;
    return { max: range.max + delta, min: range.min + delta };
}
//# sourceMappingURL=price-scale.js.map