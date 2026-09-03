export function snapStrokeCoordinate(
  value: number,
  devicePixelRatio: number,
  cssLineWidth = 1,
) {
  const ratio = Math.max(1, devicePixelRatio);
  const physicalWidth = Math.max(1, Math.round(cssLineWidth * ratio));
  const offset = physicalWidth % 2 === 1 ? 0.5 : 0;
  return (Math.round(value * ratio) + offset) / ratio;
}

export function snapFillCoordinate(value: number, devicePixelRatio: number) {
  return Math.round(value * devicePixelRatio) / devicePixelRatio;
}

export function containingBarIndex(
  bars: ReadonlyArray<{ time: number }>,
  time: number,
) {
  if (!bars.length || !Number.isFinite(time) || time < bars[0].time) return -1;
  let low = 0;
  let high = bars.length - 1;
  let containing = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (bars[middle].time <= time) {
      containing = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  if (containing < bars.length - 1) return containing;
  if (time === bars[containing].time) return containing;
  if (bars.length < 2) return -1;
  const interval = bars[containing].time - bars[containing - 1].time;
  return interval > 0 && time < bars[containing].time + interval
    ? containing
    : -1;
}
