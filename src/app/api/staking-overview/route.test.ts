import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchStakedVision,
  fetchTotalVisionSupply,
  getSvsnSubgraphUrl,
  getVsnSubgraphUrl,
} from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";
import { POST } from "./route";

vi.mock("@/services/graph", () => ({
  fetchStakedVision: vi.fn(),
  fetchTotalVisionSupply: vi.fn(),
  getSvsnSubgraphUrl: vi.fn(),
  getVsnSubgraphUrl: vi.fn(),
}));

vi.mock("@/services/price", () => ({
  fetchVSNPrice: vi.fn(),
}));

const mockGetVsnSubgraphUrl = vi.mocked(getVsnSubgraphUrl);
const mockGetSvsnSubgraphUrl = vi.mocked(getSvsnSubgraphUrl);
const mockFetchTotalVisionSupply = vi.mocked(fetchTotalVisionSupply);
const mockFetchStakedVision = vi.mocked(fetchStakedVision);
const mockFetchVSNPrice = vi.mocked(fetchVSNPrice);

describe("/api/staking-overview route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns supply, staking, and price data from the expected subgraphs", async () => {
    const vsnQueryUrl = "https://example.test/vsn";
    const svsnQueryUrl = "https://example.test/svsn";

    mockGetVsnSubgraphUrl.mockReturnValue(vsnQueryUrl);
    mockGetSvsnSubgraphUrl.mockReturnValue(svsnQueryUrl);
    mockFetchTotalVisionSupply.mockResolvedValue(1_000);
    mockFetchStakedVision.mockResolvedValue(250);
    mockFetchVSNPrice.mockResolvedValue(0.42);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(mockFetchTotalVisionSupply).toHaveBeenCalledWith(vsnQueryUrl);
    expect(mockFetchStakedVision).toHaveBeenCalledWith(svsnQueryUrl);
    expect(mockFetchVSNPrice).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({
      data: {
        totalVisionSupply: 1_000,
        stakedVision: 250,
        currentPrice: 0.42,
      },
    });
  });
});
