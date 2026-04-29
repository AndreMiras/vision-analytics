import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchPerformanceSnapshots,
  fetchTVLSnapshots,
  getSvsnSubgraphUrl,
} from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";
import { POST } from "./route";

vi.mock("@/services/graph", () => ({
  fetchPerformanceSnapshots: vi.fn(),
  fetchTVLSnapshots: vi.fn(),
  getSvsnSubgraphUrl: vi.fn(),
}));

vi.mock("@/services/price", () => ({
  fetchVSNPrice: vi.fn(),
}));

const mockGetSvsnSubgraphUrl = vi.mocked(getSvsnSubgraphUrl);
const mockFetchPerformanceSnapshots = vi.mocked(fetchPerformanceSnapshots);
const mockFetchTVLSnapshots = vi.mocked(fetchTVLSnapshots);
const mockFetchVSNPrice = vi.mocked(fetchVSNPrice);

const createRequest = (body: unknown) =>
  new Request("https://example.test/api/metrics", {
    method: "POST",
    body: JSON.stringify(body),
  }) as NextRequest;

describe("/api/metrics route", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns HTTP 400 for an invalid metric type", async () => {
    const response = await POST(createRequest({ type: "invalid" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid metric type. Must be one of: performance, tvl",
    });
  });

  it("fetches performance snapshots by default with a derived start time", async () => {
    const queryUrl = "https://example.test/svsn";
    const snapshots = [{ timestamp: 1_699_740_800, value: 1.23 }];

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-11-17T00:00:00.000Z"));
    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchPerformanceSnapshots.mockResolvedValue(snapshots);
    mockFetchVSNPrice.mockResolvedValue(0.42);

    const response = await POST(createRequest({ timeframe: 3 }));

    expect(response.status).toBe(200);
    expect(mockFetchPerformanceSnapshots).toHaveBeenCalledWith(
      queryUrl,
      1_699_920_000,
    );
    expect(mockFetchTVLSnapshots).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: {
        currentPrice: 0.42,
        timeframe: 3,
        type: "performance",
        yieldSnapshots: snapshots,
      },
    });
  });

  it("fetches TVL snapshots when the tvl metric type is requested", async () => {
    const queryUrl = "https://example.test/svsn";
    const snapshots = [{ timestamp: 1_699_920_000, totalAssets: 123 }];

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-11-17T00:00:00.000Z"));
    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchTVLSnapshots.mockResolvedValue(snapshots);
    mockFetchVSNPrice.mockResolvedValue(0.51);

    const response = await POST(createRequest({ timeframe: 1, type: "tvl" }));

    expect(response.status).toBe(200);
    expect(mockFetchTVLSnapshots).toHaveBeenCalledWith(queryUrl, 1_700_092_800);
    expect(mockFetchPerformanceSnapshots).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: {
        currentPrice: 0.51,
        timeframe: 1,
        type: "tvl",
        yieldSnapshots: snapshots,
      },
    });
  });

  it("uses a start time of 1 for non-numeric timeframes", async () => {
    const queryUrl = "https://example.test/svsn";

    mockGetSvsnSubgraphUrl.mockReturnValue(queryUrl);
    mockFetchPerformanceSnapshots.mockResolvedValue([]);
    mockFetchVSNPrice.mockResolvedValue(0.42);

    const response = await POST(createRequest({ timeframe: "last-week" }));

    expect(response.status).toBe(200);
    expect(mockFetchPerformanceSnapshots).toHaveBeenCalledWith(queryUrl, 1);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        timeframe: "last-week",
        type: "performance",
      },
    });
  });
});
