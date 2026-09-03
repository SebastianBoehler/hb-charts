import type { RealtimeStatusHandler } from "./types";
export interface BrowserWebSocket {
    close: () => void;
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((event: {
        data: unknown;
    }) => void) | null;
    onopen: (() => void) | null;
    readyState: number;
    send: (message: string) => void;
}
interface Listener {
    onMessage: (message: unknown) => void;
    onStatus?: RealtimeStatusHandler;
}
interface TransportOptions {
    createSocket?: (endpoint: string) => BrowserWebSocket;
    endpoint: string;
    heartbeat?: {
        intervalMs: number;
        message: string;
    };
    messageKey: (message: unknown) => string | null;
    subscribeMessage: (keys: string[]) => string;
    unsubscribeMessage: (keys: string[]) => string;
}
export declare function createRealtimeTransport(options: TransportOptions): {
    subscribe(input: {
        key: string;
        listenerId: string;
    } & Listener): void;
    unsubscribe: (listenerId: string) => void;
};
export {};
//# sourceMappingURL=transport.d.ts.map