export const latestSupplyQuery = `
  query GetLatestSupply {
    supplySnapshots(
      first: 1
      orderBy: blockNumber
      orderDirection: desc
    ) {
      id
      totalSupply
      timestamp
      blockNumber
    }
  }
`;

export const supplyOverTimeQuery = `
  query GetSupplyOverTime($startTime: BigInt!, $endTime: BigInt!) {
    supplySnapshots(
      where: { timestamp_gte: $startTime, timestamp_lte: $endTime }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
    ) {
      id
      totalSupply
      timestamp
      blockNumber
      eventType
    }
  }
`;
