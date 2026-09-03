import type { CandleAppearance, ChartTheme } from "./types";
export interface ChartPalette {
    background: string;
    down: string;
    grid: string;
    label: string;
    mutedLine: string;
    primary: string;
    secondary: string;
    up: string;
    volumeDown: string;
    volumeUp: string;
    warm: string;
}
export declare const chartPalettes: Record<ChartTheme, ChartPalette>;
export interface CandlePalette {
    down: string;
    up: string;
    volumeDown: string;
    volumeUp: string;
}
export declare function candlePalette(theme: ChartTheme, appearance: CandleAppearance): CandlePalette;
export declare function toneColor(tone: "negative" | "neutral" | "positive" | undefined, palette: ChartPalette): string;
//# sourceMappingURL=palette.d.ts.map