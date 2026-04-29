import { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";
import { getUnstakingOverview } from "@/utils/unstaking";
import { describe, expect, it } from "vitest";

const snapshot = (
  overrides: Partial<ConvertedUnstakingSnapshot>,
): ConvertedUnstakingSnapshot => ({
  blockTimestamp: 1_700_000_000,
  cooldownEnd: 1_700_000_000,
  shares: 0,
  transactionHash: "0x0",
  ...overrides,
});

describe("getUnstakingOverview", () => {
  it("excludes expired cooldowns from pending calculations", () => {
    const overview = getUnstakingOverview(
      [
        snapshot({
          cooldownEnd: 1_700_000_100,
          shares: 10,
          transactionHash: "0xpending",
        }),
        snapshot({
          cooldownEnd: 1_699_999_999,
          shares: 20,
          transactionHash: "0xexpired",
        }),
      ],
      1_700_000_000,
    );

    expect(overview.pendingCooldowns).toEqual([
      expect.objectContaining({ transactionHash: "0xpending" }),
    ]);
    expect(overview.totalPending).toBe(10);
  });

  it("sums pending shares into totalPending", () => {
    const overview = getUnstakingOverview(
      [
        snapshot({ cooldownEnd: 1_700_000_100, shares: 10 }),
        snapshot({ cooldownEnd: 1_700_000_200, shares: 12.5 }),
      ],
      1_700_000_000,
    );

    expect(overview.totalPending).toBe(22.5);
  });

  it("uses the earliest pending cooldownEnd as nextUnlock", () => {
    const overview = getUnstakingOverview(
      [
        snapshot({ cooldownEnd: 1_700_000_300, shares: 10 }),
        snapshot({ cooldownEnd: 1_700_000_100, shares: 20 }),
        snapshot({ cooldownEnd: 1_700_000_200, shares: 30 }),
      ],
      1_700_000_000,
    );

    expect(overview.nextUnlock).toBe(1_700_000_100);
  });

  it("groups multiple cooldowns on the same UTC date into one chart row", () => {
    const overview = getUnstakingOverview(
      [
        snapshot({
          cooldownEnd: Date.parse("2026-04-29T01:00:00.000Z") / 1000,
          shares: 10,
        }),
        snapshot({
          cooldownEnd: Date.parse("2026-04-29T23:00:00.000Z") / 1000,
          shares: 15,
        }),
      ],
      Date.parse("2026-04-28T00:00:00.000Z") / 1000,
    );

    expect(overview.chartData).toEqual([
      {
        date: "2026-04-29",
        amount: 25,
        timestamp: Date.parse("2026-04-29T00:00:00.000Z") / 1000,
      },
    ]);
  });

  it("sorts chart rows by timestamp", () => {
    const overview = getUnstakingOverview(
      [
        snapshot({
          cooldownEnd: Date.parse("2026-05-02T12:00:00.000Z") / 1000,
          shares: 10,
        }),
        snapshot({
          cooldownEnd: Date.parse("2026-04-30T12:00:00.000Z") / 1000,
          shares: 20,
        }),
      ],
      Date.parse("2026-04-29T00:00:00.000Z") / 1000,
    );

    expect(overview.chartData.map((item) => item.date)).toEqual([
      "2026-04-30",
      "2026-05-02",
    ]);
  });

  it("returns empty values when there are no pending cooldowns", () => {
    const overview = getUnstakingOverview(
      [
        snapshot({ cooldownEnd: 1_699_999_900, shares: 10 }),
        snapshot({ cooldownEnd: 1_700_000_000, shares: 20 }),
      ],
      1_700_000_000,
    );

    expect(overview).toEqual({
      pendingCooldowns: [],
      totalPending: 0,
      nextUnlock: null,
      chartData: [],
    });
  });
});
