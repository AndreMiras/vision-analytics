import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchStakingRatioHistory,
  getSvsnSubgraphUrl,
  getVsnSubgraphUrl,
} from "@/services/graph";
import type { StakingRatioDataPoint } from "@/types/api/staking";
import { POST } from "./route";

vi.mock("@/services/graph", () => ({
  fetchStakingRatioHistory: vi.fn(),
  getSvsnSubgraphUrl: vi.fn(),
  getVsnSubgraphUrl: vi.fn(),
}));

const mockGetVsnSubgraphUrl = vi.mocked(getVsnSubgraphUrl);
const mockGetSvsnSubgraphUrl = vi.mocked(getSvsnSubgraphUrl);
const mockFetchStakingRatioHistory = vi.mocked(fetchStakingRatioHistory);

const createRequest = (body: unknown) =>
  new Request("https://example.test/api/staking-history", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("/api/staking-history route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses a default daysBack value when none is provided", async () => {
    const vsnQueryUrl = "https://example.test/vsn";
    const svsnQueryUrl = "https://example.test/svsn";
    const historyData: StakingRatioDataPoint[] = [
      {
        timestamp: 1_700_000_000,
        date: "2023-11-14",
        totalSupply: 1_000,
        stakedAmount: 250,
        stakedPercent: 25,
        unstakedAmount: 750,
        unstakedPercent: 75,
      },
    ];

    mockGetVsnSubgraphUrl.mockReturnValue(vsnQueryUrl);
    mockGetSvsnSubgraphUrl.mockReturnValue(svsnQueryUrl);
    mockFetchStakingRatioHistory.mockResolvedValue(historyData);

    const response = await POST(createRequest({}));

    expect(response.status).toBe(200);
    expect(mockFetchStakingRatioHistory).toHaveBeenCalledWith(
      vsnQueryUrl,
      svsnQueryUrl,
      30,
    );
    await expect(response.json()).resolves.toEqual({
      data: historyData,
    });
  });

  it("passes a custom daysBack value through to the service", async () => {
    const vsnQueryUrl = "https://example.test/vsn";
    const svsnQueryUrl = "https://example.test/svsn";

    mockGetVsnSubgraphUrl.mockReturnValue(vsnQueryUrl);
    mockGetSvsnSubgraphUrl.mockReturnValue(svsnQueryUrl);
    mockFetchStakingRatioHistory.mockResolvedValue([]);

    const response = await POST(createRequest({ daysBack: 7 }));

    expect(response.status).toBe(200);
    expect(mockFetchStakingRatioHistory).toHaveBeenCalledWith(
      vsnQueryUrl,
      svsnQueryUrl,
      7,
    );
    await expect(response.json()).resolves.toEqual({
      data: [],
    });
  });
});
