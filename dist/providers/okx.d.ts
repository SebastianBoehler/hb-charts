import type { RealtimeBarHandler, RealtimeStatusHandler } from "./types";
export declare function okxKlineChannel(resolution: string): string;
export declare function parseOkxKlineMessage(message: unknown): {
    close: number;
    high: number;
    low: number;
    open: number;
    time: number;
    volume: number | undefined;
}[];
export declare function subscribeOkxBars(options: {
    listenerId: string;
    onBar: RealtimeBarHandler;
    onStatus?: RealtimeStatusHandler;
    resolution: string;
    symbol: string;
}): () => void;
//# sourceMappingURL=okx.d.ts.map