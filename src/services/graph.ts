import getYieldSnapshotsQuery from "@/queries/snapshots";

// The Graph's maximum page size
const PAGE_SIZE = 1000;

interface YieldSnapshotsResponse {
  data: {
    yieldSnapshots: Array<{
      exchangeRate: string;
      timestamp: string;
    }>;
  };
}

export const fetchYieldSnapshotsPage = async (
  queryUrl: string,
  startTime: number,
  skip: number,
): Promise<Array<{ exchangeRate: string; timestamp: string }>> => {
  const body = JSON.stringify({
    query: getYieldSnapshotsQuery,
    variables: { startTime, skip },
  });
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = (await response.json()) as YieldSnapshotsResponse;
  return json.data.yieldSnapshots;
};

export const fetchAllYieldSnapshots = async (
  queryUrl: string,
  startTime: number,
): Promise<Array<{ exchangeRate: string; timestamp: string }>> => {
  // Fetch first page
  const firstPage = await fetchYieldSnapshotsPage(queryUrl, startTime, 0);
  let allData = [...firstPage];

  // If we got a full page, there might be more
  if (firstPage.length === PAGE_SIZE) {
    let skip = PAGE_SIZE;
    while (true) {
      const nextPage = await fetchYieldSnapshotsPage(queryUrl, startTime, skip);
      if (nextPage.length === 0) break;

      allData = [...allData, ...nextPage];
      if (nextPage.length < PAGE_SIZE) break;

      skip += PAGE_SIZE;
    }
  }

  return allData;
};
