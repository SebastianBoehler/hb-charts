export const chartPalettes = {
    dark: {
        background: "#101319",
        down: "#ef7d73",
        grid: "rgba(222, 229, 240, 0.075)",
        label: "rgba(232, 236, 242, 0.68)",
        mutedLine: "rgba(190, 199, 211, 0.56)",
        primary: "#8fa8ff",
        secondary: "#b8a3ee",
        up: "#68c69a",
        volumeDown: "rgba(239, 125, 115, 0.34)",
        volumeUp: "rgba(104, 198, 154, 0.34)",
        warm: "#e2bd65",
    },
    light: {
        background: "#f8f5ee",
        down: "#b9483d",
        grid: "rgba(43, 47, 44, 0.14)",
        label: "rgba(34, 38, 35, 0.7)",
        mutedLine: "rgba(63, 68, 64, 0.7)",
        primary: "#4059d8",
        secondary: "#6d5aa3",
        up: "#197451",
        volumeDown: "rgba(185, 72, 61, 0.46)",
        volumeUp: "rgba(25, 116, 81, 0.46)",
        warm: "#92670f",
    },
};
export function candlePalette(theme, appearance) {
    const palette = chartPalettes[theme];
    if (appearance === "classic") {
        return {
            down: palette.down,
            up: palette.up,
            volumeDown: palette.volumeDown,
            volumeUp: palette.volumeUp,
        };
    }
    return {
        down: theme === "dark" ? "rgba(128, 133, 129, 0.40)" : "rgba(43, 48, 45, 0.42)",
        up: theme === "dark" ? "rgba(218, 220, 215, 0.46)" : "rgba(90, 96, 92, 0.34)",
        volumeDown: theme === "dark" ? "rgba(128, 133, 129, 0.24)" : "rgba(43, 48, 45, 0.26)",
        volumeUp: theme === "dark" ? "rgba(218, 220, 215, 0.28)" : "rgba(90, 96, 92, 0.22)",
    };
}
export function toneColor(tone, palette) {
    if (tone === "negative")
        return palette.down;
    if (tone === "positive")
        return palette.up;
    return palette.primary;
}
//# sourceMappingURL=palette.js.map