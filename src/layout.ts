import type { ChartPane, ChartPaneLayout } from "./types";

export const CHART_PADDING = { left: 12, right: 62, top: 18 } as const;
export const TIME_AXIS_HEIGHT = 28;

export function buildPaneLayout(
  height: number,
  panes: readonly ChartPane[],
  collapsed: ReadonlySet<string> = new Set(),
): ChartPaneLayout {
  const available = Math.max(0, height - CHART_PADDING.top - 12 - 2 - TIME_AXIS_HEIGHT);
  if (!panes.length) return { paneHeight: 0, panes: [], priceHeight: available };
  const collapsedHeight = 22;
  const maximumStudyHeight = Math.min(available * 0.42, Math.max(0, available - 128));
  const expanded = panes.filter((pane) => !collapsed.has(pane.id));
  const collapsedCount = panes.length - expanded.length;
  const remaining = Math.max(0, maximumStudyHeight - collapsedCount * collapsedHeight);
  const expandedHeight = expanded.length
    ? Math.max(40, Math.min(72, remaining / expanded.length))
    : 0;
  const paneHeight = collapsedCount * collapsedHeight + expanded.length * expandedHeight;
  const priceHeight = Math.max(0, available - paneHeight);
  let top = CHART_PADDING.top + priceHeight + 12;
  return {
    paneHeight,
    panes: panes.map((pane) => {
      const isCollapsed = collapsed.has(pane.id);
      const rectangle = {
        collapsed: isCollapsed,
        height: isCollapsed ? collapsedHeight : expandedHeight,
        id: pane.id,
        top,
      };
      top += rectangle.height;
      return rectangle;
    }),
    priceHeight,
  };
}
