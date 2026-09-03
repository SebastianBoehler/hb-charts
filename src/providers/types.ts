import type { ChartBar } from "../types";

export type RealtimeConnectionStatus = "connecting" | "error" | "reconnecting";
export type RealtimeBarHandler = (bar: ChartBar) => void;
export type RealtimeStatusHandler = (status: RealtimeConnectionStatus) => void;
