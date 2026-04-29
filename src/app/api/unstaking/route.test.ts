import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchUnstakingSnapshots, getSvsnSubgraphUrl } from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";
import type { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";
import { POST } from "./route";

vi.mock("@/services/graph", () => ({
  fetchUnstakingSnapshots: vi.fn(),
  getSvsnSubgraphUrl: vi.fn(),
}));

vi.mock("@/services/price", () => ({
  fetchVSNPrice: vi.fn(),
}));

const mockGetSvsnSubgraphUrl = vi.mocked(getSvsnSubgraphUrl);
const mockFetchUnstakingSnapshots = vi.mocked(fetchUnstakingSnapshots);
const mockFetchVSNPrice = vi.mocked(fetchVSNPrice);

describe("/api/unstaking route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns unstaking snapshots with the current price", async () => {
    const queryUrl = "https://example.test/svsn";
    const unstakingSnapshots: ConvertedUnstakingSnapshot[] = [
      {
        blockTimestamp: 1_700_000_000,
        cooldownEnd: 1_700_086_400,
        shares: 12.5,
        transactionHash: "0xunstaking",
      },
    ];

    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchUnstakingSnapshots.mockResolvedValue(unstakingSnapshots);
    mockFetchVSNPrice.mockResolvedValue(0.42);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(mockFetchUnstakingSnapshots).toHaveBeenCalledWith(queryUrl);
    await expect(response.json()).resolves.toEqual({
      data: {
        currentPrice: 0.42,
        unstakingSnapshots,
      },
    });
  });
});
