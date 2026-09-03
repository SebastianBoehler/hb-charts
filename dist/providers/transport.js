function browserSocket(endpoint) {
    return new WebSocket(endpoint);
}
export function createRealtimeTransport(options) {
    const channels = new Map();
    const listenerKeys = new Map();
    let socket = null;
    let heartbeat = null;
    let reconnect = null;
    const notify = (status) => channels.forEach((listeners) => listeners.forEach((listener) => listener.onStatus?.(status)));
    const send = (message) => {
        if (socket?.readyState !== 1)
            return;
        try {
            socket.send(message);
        }
        catch {
            notify("error");
        }
    };
    const connect = () => {
        if (socket || !channels.size)
            return;
        const next = (options.createSocket ?? browserSocket)(options.endpoint);
        socket = next;
        next.onopen = () => {
            if (socket !== next)
                return;
            send(options.subscribeMessage([...channels.keys()]));
            if (options.heartbeat) {
                heartbeat = setInterval(() => send(options.heartbeat.message), options.heartbeat.intervalMs);
            }
            notify("connecting");
        };
        next.onmessage = ({ data }) => {
            if (typeof data !== "string")
                return;
            try {
                const message = JSON.parse(data);
                const key = options.messageKey(message);
                if (key)
                    channels.get(key)?.forEach((listener) => listener.onMessage(message));
            }
            catch { /* Exchange heartbeats and malformed frames are ignored. */ }
        };
        next.onerror = () => notify("error");
        next.onclose = () => {
            if (socket !== next)
                return;
            if (heartbeat)
                clearInterval(heartbeat);
            heartbeat = null;
            socket = null;
            if (!channels.size)
                return;
            notify("reconnecting");
            reconnect = setTimeout(connect, 1_000);
        };
    };
    const unsubscribe = (listenerId) => {
        const key = listenerKeys.get(listenerId);
        if (!key)
            return;
        const listeners = channels.get(key);
        listenerKeys.delete(listenerId);
        listeners?.delete(listenerId);
        if (listeners?.size)
            return;
        channels.delete(key);
        send(options.unsubscribeMessage([key]));
        if (channels.size || !socket)
            return;
        if (reconnect)
            clearTimeout(reconnect);
        if (heartbeat)
            clearInterval(heartbeat);
        socket.close();
    };
    return {
        subscribe(input) {
            unsubscribe(input.listenerId);
            const shouldSubscribe = !channels.has(input.key);
            const listeners = channels.get(input.key) ?? new Map();
            listeners.set(input.listenerId, input);
            channels.set(input.key, listeners);
            listenerKeys.set(input.listenerId, input.key);
            input.onStatus?.("connecting");
            if (!socket)
                connect();
            else if (shouldSubscribe)
                send(options.subscribeMessage([input.key]));
        },
        unsubscribe,
    };
}
//# sourceMappingURL=transport.js.map