import { describe, expect, test } from "bun:test";
import { bybitKlineTopic, parseBybitKlineMessage } from "./bybit";
import { okxKlineChannel, parseOkxKlineMessage } from "./okx";

describe("public provider parsers", () => {
  test("normalizes Bybit kline messages", () => {
    expect(bybitKlineTopic("BTCUSDT", "1D")).toBe("kline.D.BTCUSDT");
    expect(parseBybitKlineMessage({ data: [{ start: 1_700_000_000_000, open: "1", high: "2", low: "0.5", close: "1.5", volume: "10" }] })[0])
      .toEqual({ time: 1_700_000_000_000, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 });
  });

  test("normalizes OKX mark-price candle messages", () => {
    expect(okxKlineChannel("60")).toBe("mark-price-candle1H");
    expect(parseOkxKlineMessage({ data: [["1700000000000", "1", "2", "0.5", "1.5", "0", "10"]] })[0])
      .toEqual({ time: 1_700_000_000_000, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 });
  });
});
