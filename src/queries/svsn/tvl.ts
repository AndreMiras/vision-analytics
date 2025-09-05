import { createYieldSnapshotsQuery } from "../shared/builders";

export const tvlQuery = (timeRange: boolean = true) =>
  createYieldSnapshotsQuery(
    ["id", "totalAssets", "totalSupply", "timestamp"],
    timeRange,
  );
