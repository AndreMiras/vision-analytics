import { calculateAPY, calculateCurrentAPY } from "@/utils/apy";
import { describe, expect, it } from "vitest";

describe("apy", () => {
  describe("calculateAPY", () => {
    it("annualizes a simple one-year rate change", () => {
      const oneYearInSeconds = 365 * 24 * 60 * 60;

      expect(calculateAPY(1, 1.1, 0, oneYearInSeconds)).toBeCloseTo(10);
    });
  });

  describe("calculateCurrentAPY", () => {
    it("returns null with fewer than two points", () => {
      expect(calculateCurrentAPY([])).toBeNull();
      expect(
        calculateCurrentAPY([{ timestamp: 0, exchangeRate: 1 }]),
      ).toBeNull();
    });

    it("uses the first and last data points when middle points exist", () => {
      const oneYearInSeconds = 365 * 24 * 60 * 60;

      expect(
        calculateCurrentAPY([
          { timestamp: 0, exchangeRate: 1 },
          { timestamp: oneYearInSeconds / 2, exchangeRate: 5 },
          { timestamp: oneYearInSeconds, exchangeRate: 1.1 },
        ]),
      ).toBeCloseTo(10);
    });
  });
});
