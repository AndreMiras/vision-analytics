import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchDistributeRewards,
  fetchRewardsCycles,
  getSvsnSubgraphUrl,
} from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";
import {
  ConvertedDistributeRewardsEvent,
  ConvertedRewardsCycle,
} from "@/types/svsn/cycle-events";
import { POST } from "./route";

vi.mock("@/services/graph", () => ({
  fetchDistributeRewards: vi.fn(),
  fetchRewardsCycles: vi.fn(),
  getSvsnSubgraphUrl: vi.fn(),
}));

vi.mock("@/services/price", () => ({
  fetchVSNPrice: vi.fn(),
}));

const mockGetSvsnSubgraphUrl = vi.mocked(getSvsnSubgraphUrl);
const mockFetchRewardsCycles = vi.mocked(fetchRewardsCycles);
const mockFetchDistributeRewards = vi.mocked(fetchDistributeRewards);
const mockFetchVSNPrice = vi.mocked(fetchVSNPrice);

const createCycle = (
  id: string,
  overrides: Partial<ConvertedRewardsCycle> = {},
): ConvertedRewardsCycle => ({
  id,
  rewardsCycleAmount: 100,
  rewardsCycleEndTimestamp: 2_000,
  newBpsYieldCapPerSecond: 0.000001,
  blockTimestamp: 1_000,
  transactionHash: `0x${id}`,
  duration: 1_000,
  status: "ongoing",
  progressPercent: 25,
  timeRemaining: 750,
  ...overrides,
});

const createDistribution = (
  id: string,
  timestamp: number,
  rewards: number,
): ConvertedDistributeRewardsEvent => ({
  id,
  timestamp,
  txHash: `0x${id}`,
  rewards,
});

describe("/api/rewards-cycles route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns current-cycle analytics and completed-cycle historical averages", async () => {
    const queryUrl = "https://example.test/svsn";
    const ongoingCycle = createCycle("ongoing", {
      blockTimestamp: 1_000,
      rewardsCycleEndTimestamp: 2_000,
      rewardsCycleAmount: 100,
      status: "ongoing",
    });
    const firstCompletedCycle = createCycle("completed-1", {
      blockTimestamp: 300,
      rewardsCycleEndTimestamp: 500,
      rewardsCycleAmount: 50,
      duration: 200,
      status: "completed",
      progressPercent: 100,
      timeRemaining: 0,
    });
    const secondCompletedCycle = createCycle("completed-2", {
      blockTimestamp: 600,
      rewardsCycleEndTimestamp: 900,
      rewardsCycleAmount: 75,
      duration: 300,
      status: "completed",
      progressPercent: 100,
      timeRemaining: 0,
    });
    const distributions = [
      createDistribution("completed-1-a", 300, 10),
      createDistribution("completed-1-b", 400, 20),
      createDistribution("between-cycles", 550, 30),
      createDistribution("completed-2-a", 700, 40),
      createDistribution("before-current", 999, 5),
      createDistribution("current-1", 1_100, 10),
      createDistribution("current-2", 1_200, 15),
      createDistribution("after-current", 2_001, 20),
    ];

    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchRewardsCycles.mockResolvedValue([
      firstCompletedCycle,
      ongoingCycle,
      secondCompletedCycle,
    ]);
    mockFetchDistributeRewards.mockResolvedValueOnce(distributions);
    mockFetchVSNPrice.mockResolvedValue(0.42);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(mockFetchRewardsCycles).toHaveBeenCalledWith(queryUrl, 10);
    expect(mockFetchDistributeRewards).toHaveBeenCalledOnce();
    expect(mockFetchDistributeRewards).toHaveBeenCalledWith(
      queryUrl,
      firstCompletedCycle.blockTimestamp,
    );
    await expect(response.json()).resolves.toEqual({
      data: {
        currentCycle: {
          cycle: ongoingCycle,
          distributions: [
            createDistribution("current-1", 1_100, 10),
            createDistribution("current-2", 1_200, 15),
          ],
          totalDistributed: 25,
          remainingBudget: 75,
          distributionCount: 2,
          averageDistribution: 12.5,
          utilizationPercent: 25,
        },
        historicalAverage: {
          cycleDuration: 250,
          totalDistributed: 35,
          distributionCount: 1.5,
          averageDistribution: 70 / 3,
        },
        currentPrice: 0.42,
        cycles: [
          {
            cycle: firstCompletedCycle,
            totalDistributed: 30,
            remainingBudget: 20,
            distributionCount: 2,
            averageDistribution: 15,
            utilizationPercent: 60,
          },
          {
            cycle: ongoingCycle,
            totalDistributed: 25,
            remainingBudget: 75,
            distributionCount: 2,
            averageDistribution: 12.5,
            utilizationPercent: 25,
          },
          {
            cycle: secondCompletedCycle,
            totalDistributed: 40,
            remainingBudget: 35,
            distributionCount: 1,
            averageDistribution: 40,
            utilizationPercent: (40 / 75) * 100,
          },
        ],
      },
    });
  });

  it("falls back to zero averages and utilization when the ongoing cycle has no distributions", async () => {
    const queryUrl = "https://example.test/svsn";
    const ongoingCycle = createCycle("ongoing", {
      rewardsCycleAmount: 0,
      blockTimestamp: 1_000,
      rewardsCycleEndTimestamp: 2_000,
      status: "ongoing",
    });

    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchRewardsCycles.mockResolvedValue([ongoingCycle]);
    mockFetchDistributeRewards.mockResolvedValueOnce([]);
    mockFetchVSNPrice.mockResolvedValue(0);

    const response = await POST();

    await expect(response.json()).resolves.toEqual({
      data: {
        currentCycle: {
          cycle: ongoingCycle,
          distributions: [],
          totalDistributed: 0,
          remainingBudget: 0,
          distributionCount: 0,
          averageDistribution: 0,
          utilizationPercent: 0,
        },
        historicalAverage: null,
        currentPrice: 0,
        cycles: [
          {
            cycle: ongoingCycle,
            totalDistributed: 0,
            remainingBudget: 0,
            distributionCount: 0,
            averageDistribution: 0,
            utilizationPercent: 0,
          },
        ],
      },
    });
  });

  it("returns zero average distribution when completed cycles have no distributions", async () => {
    const queryUrl = "https://example.test/svsn";
    const completedCycle = createCycle("completed", {
      blockTimestamp: 100,
      rewardsCycleEndTimestamp: 200,
      duration: 100,
      status: "completed",
      progressPercent: 100,
      timeRemaining: 0,
    });

    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchRewardsCycles.mockResolvedValue([completedCycle]);
    mockFetchDistributeRewards.mockResolvedValueOnce([]);
    mockFetchVSNPrice.mockResolvedValue(0);

    const response = await POST();

    await expect(response.json()).resolves.toMatchObject({
      data: {
        historicalAverage: {
          cycleDuration: 100,
          totalDistributed: 0,
          distributionCount: 0,
          averageDistribution: 0,
        },
        cycles: [
          {
            cycle: completedCycle,
            totalDistributed: 0,
            remainingBudget: 100,
            distributionCount: 0,
            averageDistribution: 0,
            utilizationPercent: 0,
          },
        ],
      },
    });
  });

  it("returns empty analytics when no cycles are available", async () => {
    const queryUrl = "https://example.test/svsn";

    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchRewardsCycles.mockResolvedValue([]);
    mockFetchVSNPrice.mockResolvedValue(0.51);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(mockFetchRewardsCycles).toHaveBeenCalledWith(queryUrl, 10);
    expect(mockFetchDistributeRewards).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: {
        currentCycle: null,
        historicalAverage: null,
        currentPrice: 0.51,
        cycles: [],
      },
    });
  });
});
