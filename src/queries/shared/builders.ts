export const createYieldSnapshotsQuery = (
  fields: string[],
  timeRange?: boolean,
) => `
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

export const createSupplySnapshotsQuery = (
  fields: string[],
  timeRange?: boolean,
) => `
  query getSupplySnapshots($startTime: BigInt!, ${
    timeRange ? "$endTime: BigInt!, " : ""
  }$skip: Int = 0) {
    supplySnapshots(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: {
        timestamp_gte: $startTime
        ${timeRange ? "timestamp_lte: $endTime" : ""}
      }
    ) {
      ${fields.join("\n      ")}
    }
  }
`;
