const createYieldSnapshotsQuery = (fields: string[], timeRange?: boolean) => `
  query getYieldSnapshots($startTime: BigInt!, ${
    timeRange ? "$endTime: BigInt!, " : ""
  }$skip: Int = 0) {
    yieldSnapshots(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: { 
        timestamp_gt: $startTime
        ${timeRange ? "timestamp_lte: $endTime" : ""}
      }
    ) {
      ${fields.join("\n      ")}
    }
  }
`;

export const performanceQuery = createYieldSnapshotsQuery([
  "id",
  "exchangeRate",
  "timestamp",
]);

export const tvlQuery = (timeRange: boolean = true) =>
  createYieldSnapshotsQuery(
    ["id", "totalAssets", "totalSupply", "timestamp"],
    timeRange,
  );

export const stakedVisionTotalSupplyQuery = `
query getLatestStakedAmount {
  yieldSnapshots(
    first: 1
    orderBy: blockNumber
    orderDirection: desc
  ) {
    totalSupply
    blockNumber
  }
}
`;
