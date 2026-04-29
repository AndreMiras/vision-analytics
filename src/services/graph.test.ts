import {
  fetchAllYieldSnapshots,
  fetchDistributeRewards,
  fetchRewardsCycles,
  fetchStakingRatioHistory,
  fetchYieldSnapshotsPage,
} from "@/services/graph";
import { BaseSnapshot } from "@/types/shared/base";
import {
  DistributeRewardsEvent,
  RewardsCycleCreated,
} from "@/types/svsn/cycle-events";
import { YieldSnapshot } from "@/types/svsn/snapshots";
import { SupplySnapshot } from "@/types/vsn/snapshots";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const PAGE_SIZE = 1000;

interface TestSnapshot extends BaseSnapshot {
  value: string;
}

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

const createSnapshot = (id: number): TestSnapshot => ({
  id: id.toString(),
  timestamp: (1_700_000_000 + id).toString(),
  blockNumber: (20_000_000 + id).toString(),
  value: `value-${id}`,
});

const createSnapshots = (length: number, startId = 0): TestSnapshot[] =>
  Array.from({ length }, (_, index) => createSnapshot(startId + index));

const mockFetchResponses = (...responses: unknown[]) => {
  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
};

const getRequestInit = (callIndex: number): RequestInit => {
  const init = fetchMock.mock.calls[callIndex]?.[1];

  if (!init) {
    throw new Error(`Missing request init for fetch call ${callIndex}`);
  }

  return init;
};

const getRequestBody = (
  callIndex: number,
): { query: string; variables: Record<string, unknown> } => {
  const body = getRequestInit(callIndex).body;

  if (typeof body !== "string") {
    throw new Error(`Missing string body for fetch call ${callIndex}`);
  }

  return JSON.parse(body) as {
    query: string;
    variables: Record<string, unknown>;
  };
};

const wei = (tokens: number): string => `${tokens}000000000000000000`;

const createSupplySnapshot = (
  timestamp: number,
  totalSupply: number,
): SupplySnapshot => ({
  id: `supply-${timestamp}`,
  timestamp: timestamp.toString(),
  blockNumber: (20_000_000 + timestamp).toString(),
  totalSupply: wei(totalSupply),
});

const createStakingSnapshot = (
  timestamp: number,
  totalSupply: number,
): YieldSnapshot => ({
  id: `staking-${timestamp}`,
  timestamp: timestamp.toString(),
  blockNumber: (30_000_000 + timestamp).toString(),
  totalSupply: wei(totalSupply),
  totalAssets: wei(totalSupply),
  exchangeRate: "1",
});

const createRewardsCycle = (
  id: number,
  overrides: Partial<RewardsCycleCreated> = {},
): RewardsCycleCreated => ({
  id: `cycle-${id}`,
  timestamp: "0",
  blockNumber: `${20_000_000 + id}`,
  rewardsCycleAmount: wei(id + 1),
  rewardsCycleEndTimestamp: "1700000000",
  newBpsYieldCapPerSecond: "0.000001",
  blockTimestamp: "1699999900",
  transactionHash: `0xcycle${id}`,
  ...overrides,
});

const createRewardsCycles = (
  length: number,
  startId = 0,
): RewardsCycleCreated[] =>
  Array.from({ length }, (_, index) => createRewardsCycle(startId + index));

const createDistributeRewardsEvent = (
  id: number,
  overrides: Partial<DistributeRewardsEvent> = {},
): DistributeRewardsEvent => ({
  id: `event-${id}`,
  rewards: wei(id + 1),
  blockTimestamp: `${1_700_000_000 + id}`,
  transactionHash: `0xreward${id}`,
  ...overrides,
});

const createDistributeRewardsEvents = (
  length: number,
  startId = 0,
): DistributeRewardsEvent[] =>
  Array.from({ length }, (_, index) =>
    createDistributeRewardsEvent(startId + index),
  );

describe("graph services", () => {
  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("fetchYieldSnapshotsPage", () => {
    it("posts the query and variables to the provided subgraph URL", async () => {
      const queryUrl = "https://example.test/subgraph";
      const query = "query YieldSnapshots { yieldSnapshots { timestamp } }";
      const snapshots = createSnapshots(2);

      mockFetchResponses({ data: { yieldSnapshots: snapshots } });

      const result = await fetchYieldSnapshotsPage<TestSnapshot>(
        queryUrl,
        query,
        1_700_000_000,
        25,
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        queryUrl,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(getRequestBody(0)).toEqual({
        query,
        variables: { startTime: 1_700_000_000, skip: 25 },
      });
      expect(result).toEqual(snapshots);
    });
  });

  describe("fetchAllYieldSnapshots", () => {
    it("makes one request when the first page is shorter than the page size", async () => {
      const queryUrl = "https://example.test/subgraph";
      const query = "query YieldSnapshots { yieldSnapshots { timestamp } }";
      const snapshots = createSnapshots(3);

      mockFetchResponses({ data: { yieldSnapshots: snapshots } });

      const result = await fetchAllYieldSnapshots<TestSnapshot>(
        queryUrl,
        query,
        1_700_000_000,
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(getRequestBody(0).variables).toEqual({
        startTime: 1_700_000_000,
        skip: 0,
      });
      expect(result).toEqual(snapshots);
    });

    it("requests the next page after a full page and stops on a short page", async () => {
      const queryUrl = "https://example.test/subgraph";
      const query = "query YieldSnapshots { yieldSnapshots { timestamp } }";
      const firstPage = createSnapshots(PAGE_SIZE);
      const secondPage = createSnapshots(2, PAGE_SIZE);

      mockFetchResponses(
        { data: { yieldSnapshots: firstPage } },
        { data: { yieldSnapshots: secondPage } },
      );

      const result = await fetchAllYieldSnapshots<TestSnapshot>(
        queryUrl,
        query,
        1_700_000_000,
      );

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(getRequestBody(0).variables).toEqual({
        startTime: 1_700_000_000,
        skip: 0,
      });
      expect(getRequestBody(1).variables).toEqual({
        startTime: 1_700_000_000,
        skip: PAGE_SIZE,
      });
      expect(result).toEqual([...firstPage, ...secondPage]);
    });
  });

  describe("fetchRewardsCycles", () => {
    it("converts rewards cycles into upcoming, ongoing, and completed records", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1_700_000_000 * 1000));

      const queryUrl = "https://example.test/subgraph";
      const upcoming = createRewardsCycle(0, {
        rewardsCycleAmount: wei(1),
        rewardsCycleEndTimestamp: "1700000300",
        newBpsYieldCapPerSecond: "0.000001",
        blockTimestamp: "1700000100",
        transactionHash: "0xupcoming",
      });
      const ongoing = createRewardsCycle(1, {
        rewardsCycleAmount: wei(2),
        rewardsCycleEndTimestamp: "1700000100",
        newBpsYieldCapPerSecond: "0.000002",
        blockTimestamp: "1699999900",
        transactionHash: "0xongoing",
      });
      const completed = createRewardsCycle(2, {
        rewardsCycleAmount: wei(3),
        rewardsCycleEndTimestamp: "1699999800",
        newBpsYieldCapPerSecond: "0.000003",
        blockTimestamp: "1699999600",
        transactionHash: "0xcompleted",
      });

      mockFetchResponses({
        data: { rewardsCycleCreateds: [upcoming, ongoing, completed] },
      });

      const result = await fetchRewardsCycles(queryUrl, 10);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(getRequestBody(0).variables).toEqual({ skip: 0 });
      expect(result).toEqual([
        {
          id: "cycle-0",
          rewardsCycleAmount: 1,
          rewardsCycleEndTimestamp: 1_700_000_300,
          newBpsYieldCapPerSecond: 0.000001,
          blockTimestamp: 1_700_000_100,
          transactionHash: "0xupcoming",
          duration: 200,
          status: "upcoming",
          progressPercent: 0,
          timeRemaining: 100,
        },
        {
          id: "cycle-1",
          rewardsCycleAmount: 2,
          rewardsCycleEndTimestamp: 1_700_000_100,
          newBpsYieldCapPerSecond: 0.000002,
          blockTimestamp: 1_699_999_900,
          transactionHash: "0xongoing",
          duration: 200,
          status: "ongoing",
          progressPercent: 50,
          timeRemaining: 100,
        },
        {
          id: "cycle-2",
          rewardsCycleAmount: 3,
          rewardsCycleEndTimestamp: 1_699_999_800,
          newBpsYieldCapPerSecond: 0.000003,
          blockTimestamp: 1_699_999_600,
          transactionHash: "0xcompleted",
          duration: 200,
          status: "completed",
          progressPercent: 100,
          timeRemaining: 0,
        },
      ]);
    });

    it("requests additional pages until the limit is reached and slices extra cycles", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1_700_000_000 * 1000));

      const queryUrl = "https://example.test/subgraph";
      const firstPage = createRewardsCycles(PAGE_SIZE);
      const secondPage = createRewardsCycles(5, PAGE_SIZE);

      mockFetchResponses(
        { data: { rewardsCycleCreateds: firstPage } },
        { data: { rewardsCycleCreateds: secondPage } },
      );

      const result = await fetchRewardsCycles(queryUrl, PAGE_SIZE + 2);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(getRequestBody(0).variables).toEqual({ skip: 0 });
      expect(getRequestBody(1).variables).toEqual({ skip: PAGE_SIZE });
      expect(result).toHaveLength(PAGE_SIZE + 2);
      expect(result.at(-1)?.id).toBe(`cycle-${PAGE_SIZE + 1}`);
    });
  });

  describe("fetchDistributeRewards", () => {
    it("paginates distribution events and converts rewards into token values", async () => {
      const queryUrl = "https://example.test/subgraph";
      const startTime = 1_700_000_000;
      const firstPage = createDistributeRewardsEvents(PAGE_SIZE);
      const secondPage = [
        createDistributeRewardsEvent(PAGE_SIZE, {
          rewards: wei(1001),
          blockTimestamp: "1700001000",
          transactionHash: "0xreward1000",
        }),
        createDistributeRewardsEvent(PAGE_SIZE + 1, {
          rewards: wei(1002),
          blockTimestamp: "1700001001",
          transactionHash: "0xreward1001",
        }),
      ];

      mockFetchResponses(
        { data: { distributeRewards_collection: firstPage } },
        { data: { distributeRewards_collection: secondPage } },
      );

      const result = await fetchDistributeRewards(queryUrl, startTime);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(getRequestBody(0).variables).toEqual({
        skip: 0,
        startTime,
      });
      expect(getRequestBody(1).variables).toEqual({
        skip: PAGE_SIZE,
        startTime,
      });
      expect(result).toHaveLength(PAGE_SIZE + 2);
      expect(result[0]).toEqual({
        id: "event-0",
        timestamp: 1_700_000_000,
        txHash: "0xreward0",
        rewards: 1,
      });
      expect(result.at(-1)).toEqual({
        id: `event-${PAGE_SIZE + 1}`,
        timestamp: 1_700_001_001,
        txHash: "0xreward1001",
        rewards: 1002,
      });
    });
  });

  describe("fetchStakingRatioHistory", () => {
    it("requests supply and staking history with a frozen time window", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1_700_000_000 * 1000));

      const visionUrl = "https://example.test/vision";
      const stakingUrl = "https://example.test/staking";

      mockFetchResponses(
        { data: { supplySnapshots: [] } },
        { data: { yieldSnapshots: [] } },
      );

      const result = await fetchStakingRatioHistory(visionUrl, stakingUrl, 7);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        visionUrl,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        stakingUrl,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(getRequestBody(0).variables).toEqual({
        startTime: "1699395200",
        endTime: "1700000000",
      });
      expect(getRequestBody(1).variables).toEqual({
        startTime: "1699395200",
        endTime: "1700000000",
      });
      expect(result).toEqual([]);
    });

    it("joins timestamps and carries forward the last known supply and staking values", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1_700_000_500 * 1000));

      const visionUrl = "https://example.test/vision";
      const stakingUrl = "https://example.test/staking";
      const supplySnapshots = [
        createSupplySnapshot(100, 1_000),
        createSupplySnapshot(300, 1_200),
        createSupplySnapshot(400, 1_600),
      ];
      const stakingSnapshots = [
        createStakingSnapshot(200, 250),
        createStakingSnapshot(300, 300),
      ];

      mockFetchResponses(
        { data: { supplySnapshots } },
        { data: { yieldSnapshots: stakingSnapshots } },
      );

      const result = await fetchStakingRatioHistory(visionUrl, stakingUrl, 30);

      expect(result).toEqual([
        {
          timestamp: 100,
          date: "1970-01-01T00:01:40.000Z",
          totalSupply: 1_000,
          stakedAmount: 0,
          stakedPercent: 0,
          unstakedAmount: 1_000,
          unstakedPercent: 1,
        },
        {
          timestamp: 200,
          date: "1970-01-01T00:03:20.000Z",
          totalSupply: 1_000,
          stakedAmount: 250,
          stakedPercent: 0.25,
          unstakedAmount: 750,
          unstakedPercent: 0.75,
        },
        {
          timestamp: 300,
          date: "1970-01-01T00:05:00.000Z",
          totalSupply: 1_200,
          stakedAmount: 300,
          stakedPercent: 0.25,
          unstakedAmount: 900,
          unstakedPercent: 0.75,
        },
        {
          timestamp: 400,
          date: "1970-01-01T00:06:40.000Z",
          totalSupply: 1_600,
          stakedAmount: 300,
          stakedPercent: 0.1875,
          unstakedAmount: 1_300,
          unstakedPercent: 0.8125,
        },
      ]);
    });

    it("samples combined data down with the current ceil step behavior", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1_700_000_000 * 1000));

      const visionUrl = "https://example.test/vision";
      const stakingUrl = "https://example.test/staking";
      const timestamps = Array.from({ length: 101 }, (_, index) => index + 1);
      const supplySnapshots = timestamps.map((timestamp) =>
        createSupplySnapshot(timestamp, 1_000 + timestamp),
      );
      const stakingSnapshots = timestamps.map((timestamp) =>
        createStakingSnapshot(timestamp, 100 + timestamp),
      );

      mockFetchResponses(
        { data: { supplySnapshots } },
        { data: { yieldSnapshots: stakingSnapshots } },
      );

      const result = await fetchStakingRatioHistory(visionUrl, stakingUrl, 30);

      expect(result).toHaveLength(51);
      expect(result.map((point) => point.timestamp)).toEqual(
        timestamps.filter((_, index) => index % 2 === 0),
      );
      expect(result.at(-1)).toEqual({
        timestamp: 101,
        date: "1970-01-01T00:01:41.000Z",
        totalSupply: 1_101,
        stakedAmount: 201,
        stakedPercent: 201 / 1_101,
        unstakedAmount: 900,
        unstakedPercent: 900 / 1_101,
      });
    });
  });
});
