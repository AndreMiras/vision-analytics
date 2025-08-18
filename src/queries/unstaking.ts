export const unstakingQuery = `
  query getUnstakingData($skip: Int!) {
    cooldownStarteds(
      first: 1000
      skip: $skip
      orderBy: cooldownEnd
      orderDirection: asc
    ) {
      blockTimestamp
      cooldownEnd
      shares
      transactionHash
    }
  }
`;

export default unstakingQuery;
