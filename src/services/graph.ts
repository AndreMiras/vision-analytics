import { fromWeiToToken } from "@/lib/utils";
import {
  BaseSnapshot,
  ConvertedPerformanceSnapshot,
  ConvertedTVLSnapshot,
  PerformanceSnapshot,
  TVLSnapshot,
} from "@/types/snapshots";
import { performanceQuery, tvlQuery } from "@/queries/snapshots";

// The Graph's maximum page size
const PAGE_SIZE = 1000;

interface YieldSnapshotsResponse<T extends BaseSnapshot> {
  data: {
    yieldSnapshots: T[];
  };
}

const convertBaseSnapshot = (snapshot: BaseSnapshot) => ({
  timestamp: parseInt(snapshot.timestamp),
});

const convertTVLSnapshot = (snapshot: TVLSnapshot): ConvertedTVLSnapshot => ({
  ...convertBaseSnapshot(snapshot),
  totalAssets: fromWeiToToken(snapshot.totalAssets),
  totalSupply: fromWeiToToken(snapshot.totalSupply),
});

const convertPerformanceSnapshot = (
  snapshot: PerformanceSnapshot,
): ConvertedPerformanceSnapshot => ({
  ...convertBaseSnapshot(snapshot),
  exchangeRate: parseFloat(snapshot.exchangeRate),
});

export const fetchYieldSnapshotsPage = async <T extends BaseSnapshot>(
  queryUrl: string,
  query: string,
  startTime: number,
  skip: number,
): Promise<T[]> => {
  const body = JSON.stringify({
    query,
    variables: { startTime, skip },
  });

  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = (await response.json()) as YieldSnapshotsResponse<T>;
  return json.data.yieldSnapshots;
};

export const fetchAllYieldSnapshots = async <T extends BaseSnapshot>(
  queryUrl: string,
  query: string,
  startTime: number,
): Promise<T[]> => {
  // Fetch first page
  const firstPage = await fetchYieldSnapshotsPage<T>(
    queryUrl,
    query,
    startTime,
    0,
  );
  let allData = [...firstPage];

  // If we got a full page, there might be more
  if (firstPage.length === PAGE_SIZE) {
    let skip = PAGE_SIZE;
    while (true) {
      const nextPage = await fetchYieldSnapshotsPage<T>(
        queryUrl,
        query,
        startTime,
        skip,
      );
      if (nextPage.length === 0) break;

      allData = [...allData, ...nextPage];
      if (nextPage.length < PAGE_SIZE) break;

      skip += PAGE_SIZE;
    }
  }

  return allData;
};

export const fetchPerformanceSnapshots = async (
  queryUrl: string,
  startTime: number,
) =>
  (
    await fetchAllYieldSnapshots<PerformanceSnapshot>(
      queryUrl,
      performanceQuery,
      startTime,
    )
  ).map(convertPerformanceSnapshot);

export const fetchTVLSnapshots = async (queryUrl: string, startTime: number) =>
  (
    await fetchAllYieldSnapshots<TVLSnapshot>(queryUrl, tvlQuery, startTime)
  ).map(convertTVLSnapshot);
