import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { createChart } from "../chart";
export function Chart({ className, style, ...options }) {
    const container = useRef(null);
    const controller = useRef(null);
    useEffect(() => {
        if (!container.current)
            return;
        controller.current = createChart(container.current, options);
        return () => {
            controller.current?.destroy();
            controller.current = null;
        };
    }, []);
    useEffect(() => {
        controller.current?.update(options);
    }, [options]);
    return _jsx("div", { className: className, ref: container, style: style });
}
//# sourceMappingURL=Chart.js.map