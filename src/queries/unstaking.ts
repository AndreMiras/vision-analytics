export const unstakingQuery = `
  query getUnstakingData($skip: Int!) {
    cooldownStarteds(
      first: 1000
      skip: $skip
      orderBy: cooldownEnd
      orderDirection: asc
    ) {
      id
      blockTimestamp
      cooldownEnd
      shares
      transactionHash
    }
  }
`;

export default unstakingQuery;
