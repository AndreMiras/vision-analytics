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
