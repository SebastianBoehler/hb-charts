import { drawHistogram, drawLine } from "./primitives";
function numericValues(layers) {
    return layers
        .flatMap((layer) => layer.values)
        .filter((value) => value !== null && Number.isFinite(value));
}
function paneDomain(pane, layers) {
    if (pane?.fixedRange)
        return { max: pane.fixedRange[1], min: pane.fixedRange[0] };
    const values = numericValues(layers);
    if (!values.length)
        return null;
    let min = Math.min(...values);
    let max = Math.max(...values);
    layers.forEach((layer) => {
        if (layer.kind === "histogram") {
            const base = layer.baseValue ?? 0;
            min = Math.min(min, base);
            max = Math.max(max, base);
        }
    });
    if (min === max) {
        const padding = Math.max(Math.abs(min) * 0.05, 1e-6);
        min -= padding;
        max += padding;
    }
    return { max, min };
}
function drawPaneAxis(ctx, pane, domain, left, top, height, width, palette, y) {
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillStyle = palette.label;
    const format = pane?.formatValue ?? ((value) => value.toFixed(Math.abs(value) < 1 ? 4 : 2));
    const axisLeft = left + width + 8;
    ctx.fillText(format(domain.max), axisLeft, top + 10);
    ctx.fillText(format(domain.min), axisLeft, top + height - 3);
    pane?.referenceLevels?.forEach((level) => {
        if (level < domain.min || level > domain.max)
            return;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = palette.grid;
        ctx.beginPath();
        ctx.moveTo(left, y(level));
        ctx.lineTo(left + width, y(level));
        ctx.stroke();
        ctx.setLineDash([]);
    });
}
export function drawPanes(options) {
    const paneMap = new Map(options.panes.map((pane) => [pane.id, pane]));
    options.layout.panes.forEach(({ collapsed, height, id, top }) => {
        options.ctx.strokeStyle = options.palette.grid;
        options.ctx.beginPath();
        options.ctx.moveTo(options.left, top);
        options.ctx.lineTo(options.left + options.width, top);
        options.ctx.stroke();
        if (collapsed || height <= 0)
            return;
        const layers = options.layers.filter((layer) => layer.paneId === id);
        const domain = paneDomain(paneMap.get(id), layers);
        if (!domain)
            return;
        const contentTop = top + 7;
        const contentHeight = Math.max(1, height - 14);
        const y = (value) => contentTop +
            (1 - (value - domain.min) / Math.max(domain.max - domain.min, 1e-9)) * contentHeight;
        options.ctx.save();
        options.ctx.beginPath();
        options.ctx.rect(options.left, top, options.width, height);
        options.ctx.clip();
        layers.forEach((layer) => {
            if (layer.kind === "line") {
                drawLine(options.ctx, layer, options.x, y, options.palette);
            }
            else {
                drawHistogram(options.ctx, layer, options.bars, options.x, y, layer.baseValue ?? 0, options.palette, options.candles);
            }
        });
        options.ctx.restore();
        drawPaneAxis(options.ctx, paneMap.get(id), domain, options.left, top, height, options.width, options.palette, y);
    });
}
//# sourceMappingURL=panes.js.map