export const DEFAULT_VISIBLE_BARS = 160;
export const MIN_VISIBLE_BARS = 30;
function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}
function visibleBarCount(barCount, requested) {
    return clamp(Math.round(requested), MIN_VISIBLE_BARS, Math.max(MIN_VISIBLE_BARS, barCount));
}
function maximumRightOffset(barCount, visibleBars) {
    return Math.max(0, barCount - Math.min(barCount, visibleBars));
}
export function panTimeViewport(viewport, barCount, delta) {
    const visibleBars = visibleBarCount(barCount, viewport.visibleBars);
    return {
        ...viewport,
        rightOffset: clamp(Math.round(viewport.rightOffset + delta), 0, maximumRightOffset(barCount, visibleBars)),
        visibleBars,
    };
}
export function scaleTimeViewport(viewport, barCount, requestedVisibleBars, anchorRatio = 1) {
    const currentVisibleBars = Math.min(barCount, visibleBarCount(barCount, viewport.visibleBars));
    const nextVisibleBars = visibleBarCount(barCount, requestedVisibleBars);
    const nextActualVisibleBars = Math.min(barCount, nextVisibleBars);
    if (!barCount)
        return { ...viewport, rightOffset: 0, visibleBars: nextVisibleBars };
    const currentRightOffset = clamp(viewport.rightOffset, 0, maximumRightOffset(barCount, currentVisibleBars));
    const currentEnd = barCount - currentRightOffset;
    const currentStart = Math.max(0, currentEnd - currentVisibleBars);
    const anchor = clamp(anchorRatio, 0, 1);
    const anchorIndex = currentStart + anchor * Math.max(0, currentVisibleBars - 1);
    const nextStart = anchorIndex - anchor * Math.max(0, nextActualVisibleBars - 1);
    const nextEnd = nextStart + nextActualVisibleBars;
    return {
        ...viewport,
        rightOffset: clamp(Math.round(barCount - nextEnd), 0, maximumRightOffset(barCount, nextActualVisibleBars)),
        visibleBars: nextVisibleBars,
    };
}
export function latestRightPaddingBars(visibleBars, rightOffset) {
    if (visibleBars <= 1 || rightOffset !== 0)
        return 0;
    return clamp(Math.round(visibleBars * 0.06), 2, 12);
}
export function timeAxisAnchorRatio(pointerX, plotLeft, dataRight) {
    return clamp((pointerX - plotLeft) / Math.max(1, dataRight - plotLeft), 0, 1);
}
//# sourceMappingURL=time-scale.js.map