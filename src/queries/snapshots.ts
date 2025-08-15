const createYieldSnapshotsQuery = (fields: string[]) => `
  query getYieldSnapshots($startTime: BigInt!, $skip: Int!) {
    yieldSnapshots(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $startTime }
    ) {
      ${fields.join("\n      ")}
    }
  }
`;

export const performanceQuery = createYieldSnapshotsQuery([
  "exchangeRate",
  "timestamp",
]);
export const tvlQuery = createYieldSnapshotsQuery([
  "totalAssets",
  "totalSupply",
  "timestamp",
]);
