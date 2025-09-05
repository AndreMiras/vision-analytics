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
