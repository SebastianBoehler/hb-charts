export type ChartResolution =
  | "1"
  | "5"
  | "15"
  | "60"
  | "240"
  | "1D"
  | "1W"
  | "1M";

export interface ChartBar {
  close: number;
  high: number;
  low: number;
  open: number;
  time: number;
  volume?: number;
}

export type NumericSeries = Array<number | null>;
export type ChartTone = "negative" | "neutral" | "positive";
export type ChartColorMode = "bar-direction" | "fixed" | "value-sign";

interface LayerBase {
  id: string;
  label?: string;
  paneId?: string;
  values: NumericSeries;
}

export interface ChartLineLayer extends LayerBase {
  kind: "line";
  color?: string;
  colorMode?: "fixed" | "value-sign";
  lineWidth?: number;
}

export interface ChartHistogramLayer extends LayerBase {
  kind: "histogram";
  baseValue?: number;
  color?: string;
  colorMode?: ChartColorMode;
}

export type ChartLayer = ChartLineLayer | ChartHistogramLayer;

export interface ChartMarker {
  label: string;
  time: number;
  tone: ChartTone;
  value: number;
}

export interface ChartPriceLevel {
  id: string;
  label: string;
  lineStyle?: "dashed" | "dotted" | "solid";
  tone?: ChartTone;
  value: number;
}

export interface ChartTimeRegion {
  color: string;
  endTime: number;
  startTime: number;
}

export interface ChartPriceRange {
  max: number;
  min: number;
}

export interface ChartViewport {
  priceRange: ChartPriceRange | null;
  rightOffset: number;
  visibleBars: number;
}

export interface ChartPane {
  fixedRange?: readonly [number, number];
  formatValue?: (value: number) => string;
  id: string;
  label: string;
  referenceLevels?: readonly number[];
}

export interface ChartPaneRectangle {
  collapsed: boolean;
  height: number;
  id: string;
  top: number;
}

export interface ChartPaneLayout {
  paneHeight: number;
  panes: ChartPaneRectangle[];
  priceHeight: number;
}

export interface ChartMetrics {
  dataRight: number;
  end: number;
  plotLeft: number;
  plotRight: number;
  priceHeight: number;
  priceRange: ChartPriceRange;
  priceScale: PriceScaleMode;
  priceTop: number;
  start: number;
}

export type ChartTheme = "dark" | "light";
export type CandleAppearance = "classic" | "muted";
export type PriceScaleMode = "linear" | "log";

export interface DrawChartOptions {
  bars: ChartBar[];
  candleAppearance?: CandleAppearance;
  layers?: ChartLayer[];
  markers?: ChartMarker[];
  paneLayout?: ChartPaneLayout;
  panes?: ChartPane[];
  priceLevels?: ChartPriceLevel[];
  priceScale?: PriceScaleMode;
  regions?: ChartTimeRegion[];
  showVolumeProfile?: boolean;
  theme?: ChartTheme;
  viewport: ChartViewport;
}

export interface CreateChartOptions
  extends Omit<DrawChartOptions, "paneLayout" | "viewport"> {
  ariaLabel?: string;
  collapsedPanes?: ReadonlySet<string>;
  onCrosshair?: (point: { bar: ChartBar; price: number | null } | null) => void;
  viewport?: ChartViewport;
}

export interface ChartController {
  destroy: () => void;
  getViewport: () => ChartViewport;
  setData: (bars: ChartBar[]) => void;
  update: (options: Partial<CreateChartOptions>) => void;
}
