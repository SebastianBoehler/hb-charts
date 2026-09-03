import type { RealtimeBarHandler, RealtimeStatusHandler } from "./types";
export declare function bybitKlineTopic(symbol: string, resolution: string): string;
export declare function parseBybitKlineMessage(message: unknown): {
    close: number;
    high: number;
    low: number;
    open: number;
    time: number;
    volume: number | undefined;
}[];
export declare function subscribeBybitBars(options: {
    listenerId: string;
    onBar: RealtimeBarHandler;
    onStatus?: RealtimeStatusHandler;
    resolution: string;
    symbol: string;
}): () => void;
//# sourceMappingURL=bybit.d.ts.map