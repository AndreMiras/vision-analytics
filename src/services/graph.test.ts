import {
  fetchAllYieldSnapshots,
  fetchYieldSnapshotsPage,
} from "@/services/graph";
import { BaseSnapshot, YieldSnapshotsResponse } from "@/types/shared/base";
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

const mockFetchResponses = (
  ...responses: YieldSnapshotsResponse<TestSnapshot>[]
) => {
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
});
