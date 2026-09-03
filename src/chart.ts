import { inspectChartPoint } from "./crosshair";
import { buildPaneLayout, TIME_AXIS_HEIGHT } from "./layout";
import { drawChart } from "./render/render-chart";
import { buildTimeAxisTicks } from "./time-axis";
import { DEFAULT_VISIBLE_BARS, panTimeViewport, scaleTimeViewport } from "./time-scale";
import type {
  ChartController,
  ChartMetrics,
  ChartViewport,
  CreateChartOptions,
} from "./types";

const defaultViewport = (): ChartViewport => ({
  priceRange: null,
  rightOffset: 0,
  visibleBars: DEFAULT_VISIBLE_BARS,
});

function styleContainer(container: HTMLElement) {
  container.style.position = "relative";
  container.style.overflow = "hidden";
  if (!container.style.minHeight) container.style.minHeight = "320px";
}

function createAxis(container: HTMLElement) {
  const axis = document.createElement("div");
  axis.setAttribute("aria-hidden", "true");
  Object.assign(axis.style, {
    bottom: "0",
    color: "#98a2b3",
    font: "10px ui-monospace, monospace",
    height: `${TIME_AXIS_HEIGHT}px`,
    left: "12px",
    pointerEvents: "none",
    position: "absolute",
    right: "62px",
  });
  container.append(axis);
  return axis;
}

function renderAxis(axis: HTMLDivElement, metrics: ChartMetrics, options: CreateChartOptions) {
  axis.replaceChildren();
  const width = Math.max(0, metrics.plotRight - metrics.plotLeft);
  buildTimeAxisTicks({ bars: options.bars, dataWidth: width, end: metrics.end, start: metrics.start })
    .forEach((tick) => {
      const label = document.createElement("span");
      label.textContent = tick.label;
      Object.assign(label.style, {
        left: `${tick.offset}px`,
        position: "absolute",
        top: "8px",
        transform: tick.align === "center" ? "translateX(-50%)" : tick.align === "end" ? "translateX(-100%)" : "none",
        whiteSpace: "nowrap",
      });
      axis.append(label);
    });
}

export function createChart(
  container: HTMLElement,
  initial: CreateChartOptions,
): ChartController {
  styleContainer(container);
  const canvas = document.createElement("canvas");
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", initial.ariaLabel ?? "Interactive financial chart");
  Object.assign(canvas.style, {
    cursor: "crosshair",
    display: "block",
    height: "100%",
    touchAction: "none",
    width: "100%",
  });
  container.append(canvas);
  const axis = createAxis(container);
  let options = { ...initial };
  let viewport = initial.viewport ?? defaultViewport();
  let metrics: ChartMetrics | null = null;
  let frame = 0;
  let drag: { pointerX: number; viewport: ChartViewport } | null = null;

  const render = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const layout = buildPaneLayout(
        container.getBoundingClientRect().height,
        options.panes ?? [],
        options.collapsedPanes,
      );
      metrics = drawChart(canvas, { ...options, paneLayout: layout, viewport });
      if (metrics) renderAxis(axis, metrics, options);
    });
  };
  const inspect = (event: PointerEvent) => {
    if (!metrics) return;
    const bounds = canvas.getBoundingClientRect();
    const point = inspectChartPoint(metrics, event.clientX - bounds.left, event.clientY - bounds.top);
    options.onCrosshair?.(point ? { bar: options.bars[point.barIndex], price: point.price } : null);
  };
  const onPointerDown = (event: PointerEvent) => {
    drag = { pointerX: event.clientX, viewport };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onPointerMove = (event: PointerEvent) => {
    inspect(event);
    if (!drag || !metrics) return;
    const pixelsPerBar = Math.max(1, (metrics.dataRight - metrics.plotLeft) / Math.max(1, metrics.end - metrics.start - 1));
    viewport = panTimeViewport(drag.viewport, options.bars.length, (event.clientX - drag.pointerX) / pixelsPerBar);
    render();
  };
  const onPointerUp = (event: PointerEvent) => {
    drag = null;
    canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = "crosshair";
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const factor = Math.exp(event.deltaY * 0.0015);
    viewport = scaleTimeViewport(viewport, options.bars.length, viewport.visibleBars * factor, 1);
    render();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const direction = event.key === "ArrowLeft" ? 1 : -1;
      viewport = panTimeViewport(viewport, options.bars.length, direction * (event.shiftKey ? 10 : 1));
      render();
    }
    if (event.key === "+" || event.key === "-") {
      viewport = scaleTimeViewport(viewport, options.bars.length, viewport.visibleBars * (event.key === "+" ? 0.85 : 1.15));
      render();
    }
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", () => options.onCrosshair?.(null));
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("keydown", onKeyDown);
  const observer = new ResizeObserver(render);
  observer.observe(container);
  render();

  return {
    destroy() {
      observer.disconnect();
      cancelAnimationFrame(frame);
      canvas.remove();
      axis.remove();
    },
    getViewport: () => ({ ...viewport }),
    setData(bars) {
      options = { ...options, bars };
      viewport = { ...viewport, rightOffset: 0 };
      render();
    },
    update(next) {
      options = { ...options, ...next };
      if (next.viewport) viewport = next.viewport;
      render();
    },
  };
}
