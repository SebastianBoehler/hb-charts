import { useEffect, useRef, type CSSProperties } from "react";
import { createChart } from "../chart";
import type { CreateChartOptions } from "../types";

export interface ChartProps extends CreateChartOptions {
  className?: string;
  style?: CSSProperties;
}

export function Chart({ className, style, ...options }: ChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!container.current) return;
    controller.current = createChart(container.current, options);
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.update(options);
  }, [options]);

  return <div className={className} ref={container} style={style} />;
}
