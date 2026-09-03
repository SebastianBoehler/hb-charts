import type { RealtimeStatusHandler } from "./types";

export interface BrowserWebSocket {
  close: () => void;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
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
  heartbeat?: { intervalMs: number; message: string };
  messageKey: (message: unknown) => string | null;
  subscribeMessage: (keys: string[]) => string;
  unsubscribeMessage: (keys: string[]) => string;
}

function browserSocket(endpoint: string) {
  return new WebSocket(endpoint) as unknown as BrowserWebSocket;
}

export function createRealtimeTransport(options: TransportOptions) {
  const channels = new Map<string, Map<string, Listener>>();
  const listenerKeys = new Map<string, string>();
  let socket: BrowserWebSocket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let reconnect: ReturnType<typeof setTimeout> | null = null;

  const notify = (status: Parameters<RealtimeStatusHandler>[0]) =>
    channels.forEach((listeners) => listeners.forEach((listener) => listener.onStatus?.(status)));
  const send = (message: string) => {
    if (socket?.readyState !== 1) return;
    try { socket.send(message); } catch { notify("error"); }
  };
  const connect = () => {
    if (socket || !channels.size) return;
    const next = (options.createSocket ?? browserSocket)(options.endpoint);
    socket = next;
    next.onopen = () => {
      if (socket !== next) return;
      send(options.subscribeMessage([...channels.keys()]));
      if (options.heartbeat) {
        heartbeat = setInterval(() => send(options.heartbeat!.message), options.heartbeat.intervalMs);
      }
      notify("connecting");
    };
    next.onmessage = ({ data }) => {
      if (typeof data !== "string") return;
      try {
        const message = JSON.parse(data) as unknown;
        const key = options.messageKey(message);
        if (key) channels.get(key)?.forEach((listener) => listener.onMessage(message));
      } catch { /* Exchange heartbeats and malformed frames are ignored. */ }
    };
    next.onerror = () => notify("error");
    next.onclose = () => {
      if (socket !== next) return;
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = null;
      socket = null;
      if (!channels.size) return;
      notify("reconnecting");
      reconnect = setTimeout(connect, 1_000);
    };
  };
  const unsubscribe = (listenerId: string) => {
    const key = listenerKeys.get(listenerId);
    if (!key) return;
    const listeners = channels.get(key);
    listenerKeys.delete(listenerId);
    listeners?.delete(listenerId);
    if (listeners?.size) return;
    channels.delete(key);
    send(options.unsubscribeMessage([key]));
    if (channels.size || !socket) return;
    if (reconnect) clearTimeout(reconnect);
    if (heartbeat) clearInterval(heartbeat);
    socket.close();
  };
  return {
    subscribe(input: { key: string; listenerId: string } & Listener) {
      unsubscribe(input.listenerId);
      const shouldSubscribe = !channels.has(input.key);
      const listeners = channels.get(input.key) ?? new Map<string, Listener>();
      listeners.set(input.listenerId, input);
      channels.set(input.key, listeners);
      listenerKeys.set(input.listenerId, input.key);
      input.onStatus?.("connecting");
      if (!socket) connect();
      else if (shouldSubscribe) send(options.subscribeMessage([input.key]));
    },
    unsubscribe,
  };
}
