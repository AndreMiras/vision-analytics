import { fromWeiToToken } from "@/lib/utils";
import {
  BaseSnapshot,
  ConvertedPerformanceSnapshot,
  ConvertedTVLSnapshot,
  ConvertedUnstakingSnapshot,
  PerformanceSnapshot,
  StakingHistoryResponse,
  SupplyOverTimeResponse,
  SupplySnapshot,
  TVLSnapshot,
  UnstakingSnapshot,
} from "@/types/snapshots";
import {
  performanceQuery,
  stakedVisionTotalSupplyQuery,
  tvlQuery,
} from "@/queries/snapshots";
import { unstakingQuery } from "@/queries/unstaking";
import { latestSupplyQuery, supplyOverTimeQuery } from "@/queries/supply";

// The Graph's maximum page size
const PAGE_SIZE = 1000;

interface YieldSnapshotsResponse<T extends BaseSnapshot> {
  data: {
    yieldSnapshots: T[];
  };
}

interface UnstakingResponse {
  data: {
    cooldownStarteds: UnstakingSnapshot[];
  };
}

interface LatestSupplyResponse {
  data: {
    supplySnapshots: SupplySnapshot[];
  };
}

interface StakingRatioDataPoint {
  timestamp: number;
  date: string;
  stakingRatio: number;
  totalSupply: number;
  stakedAmount: number;
  unstakedAmount: number;
}

export const getSubgraphUrl = (subgraphId?: string) => {
  const apiKey = process.env.THE_GRAPH_API_KEY;
  const url = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
  return url;
};

export const getSvsnSubgraphUrl = () =>
  getSubgraphUrl(process.env.SVSN_SUBGRAPH_ID);
export const getVsnSubgraphUrl = () =>
  getSubgraphUrl(process.env.VSN_SUBGRAPH_ID);

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

const convertUnstakingSnapshot = (
  snapshot: UnstakingSnapshot,
): ConvertedUnstakingSnapshot => ({
  ...snapshot,
  blockTimestamp: parseInt(snapshot.blockTimestamp),
  shares: fromWeiToToken(snapshot.shares),
  cooldownEnd: parseInt(snapshot.cooldownEnd),
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
    await fetchAllYieldSnapshots<TVLSnapshot>(
      queryUrl,
      tvlQuery(false),
      startTime,
    )
  ).map(convertTVLSnapshot);

export const fetchUnstakingSnapshots = async (
  queryUrl: string,
): Promise<ConvertedUnstakingSnapshot[]> => {
  // Fetch first page
  const firstPage = await fetchUnstakingPage(queryUrl, 0);
  let allData = [...firstPage];

  // If we got a full page, there might be more
  if (firstPage.length === PAGE_SIZE) {
    let skip = PAGE_SIZE;
    while (true) {
      const nextPage = await fetchUnstakingPage(queryUrl, skip);
      if (nextPage.length === 0) break;

      allData = [...allData, ...nextPage];
      if (nextPage.length < PAGE_SIZE) break;

      skip += PAGE_SIZE;
    }
  }

  return allData.map(convertUnstakingSnapshot);
};

const fetchUnstakingPage = async (
  queryUrl: string,
  skip: number,
): Promise<UnstakingSnapshot[]> => {
  const body = JSON.stringify({
    query: unstakingQuery,
    variables: { skip },
  });

  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = (await response.json()) as UnstakingResponse;
  return json.data.cooldownStarteds;
};

export const fetchTotalVisionSupply = async (
  queryUrl: string,
): Promise<number> => {
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: latestSupplyQuery }),
  });

  const json = (await response.json()) as LatestSupplyResponse;

  if (json.data.supplySnapshots.length > 0) {
    const latestSnapshot = json.data.supplySnapshots[0];
    return fromWeiToToken(latestSnapshot.totalSupply);
  }
  console.warn("No supply data found in subgraph");
  return 0;
};

export const fetchStakedVision = async (queryUrl: string): Promise<number> => {
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: stakedVisionTotalSupplyQuery }),
  });

  const json = await response.json();

  if (json.data.yieldSnapshots && json.data.yieldSnapshots.length > 0) {
    const latestSnapshot = json.data.yieldSnapshots[0];
    return fromWeiToToken(latestSnapshot.totalSupply);
  }
  console.warn("No staked VISION data found in subgraph");
  return 0;
};

export const fetchStakingRatioHistory = async (
  visionSubgraphUrl: string,
  stakingSubgraphUrl: string,
  daysBack: number = 30,
): Promise<StakingRatioDataPoint[]> => {
  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - daysBack * 24 * 60 * 60;

  // Fetch supply data from VISION subgraph
  const supplyOverTimeBody = JSON.stringify({
    query: supplyOverTimeQuery,
    variables: {
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    },
  });
  const supplyResponse = await fetch(visionSubgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: supplyOverTimeBody,
  });

  // Fetch staking data from staking subgraph
  const stakingHistoryBody = JSON.stringify({
    query: tvlQuery(true),
    variables: {
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    },
  });
  const stakingResponse = await fetch(stakingSubgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stakingHistoryBody,
  });

  const [supplyJson, stakingJson] = await Promise.all([
    supplyResponse.json() as Promise<SupplyOverTimeResponse>,
    stakingResponse.json() as Promise<StakingHistoryResponse>,
  ]);

  // Convert to maps for efficient lookup
  const supplyByTimestamp = new Map<number, number>();
  const stakingByTimestamp = new Map<number, number>();

  // Process supply snapshots
  supplyJson.data.supplySnapshots.forEach((snapshot) => {
    const timestamp = parseInt(snapshot.timestamp);
    const supply = parseFloat(snapshot.totalSupply) / Math.pow(10, 18);
    supplyByTimestamp.set(timestamp, supply);
  });

  // Process staking snapshots
  stakingJson.data.yieldSnapshots.forEach((snapshot) => {
    const timestamp = parseInt(snapshot.timestamp);
    const staked = parseFloat(snapshot.totalSupply) / Math.pow(10, 18);
    stakingByTimestamp.set(timestamp, staked);
  });

  // Combine data points and calculate ratios
  const combinedData: StakingRatioDataPoint[] = [];
  const allTimestamps = new Set([
    ...supplyByTimestamp.keys(),
    ...stakingByTimestamp.keys(),
  ]);

  // Sort timestamps
  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  let lastKnownSupply = 0;
  let lastKnownStaked = 0;

  sortedTimestamps.forEach((timestamp) => {
    // Use latest known values if data point doesn't exist
    const currentSupply = supplyByTimestamp.get(timestamp) || lastKnownSupply;
    const currentStaked = stakingByTimestamp.get(timestamp) || lastKnownStaked;

    if (currentSupply > 0) {
      const stakingRatio = (currentStaked / currentSupply) * 100;
      const unstakedAmount = currentSupply - currentStaked;

      combinedData.push({
        timestamp,
        date: new Date(timestamp * 1000).toISOString(),
        stakingRatio,
        totalSupply: currentSupply,
        stakedAmount: currentStaked,
        unstakedAmount,
      });

      lastKnownSupply = currentSupply;
      lastKnownStaked = currentStaked;
    }
  });

  // Sample data if we have too many points (keep every nth point)
  const maxPoints = 100;
  if (combinedData.length > maxPoints) {
    const step = Math.ceil(combinedData.length / maxPoints);
    return combinedData.filter((_, index) => index % step === 0);
  }

  return combinedData;
};
