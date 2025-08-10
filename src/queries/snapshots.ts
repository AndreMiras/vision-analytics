const getYieldSnapshotsQuery = `
  query getYieldSnapshots($startTime: BigInt!, $skip: Int!) {
    yieldSnapshots(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $startTime }
    ) {
      exchangeRate
      timestamp
    }
  }
`;

export default getYieldSnapshotsQuery;
