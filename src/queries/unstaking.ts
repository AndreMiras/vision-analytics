export const unstakingQuery = `
  query getUnstakingData($skip: Int!) {
    cooldownStarteds(
      first: 1000
      skip: $skip
      orderBy: cooldownEnd
      orderDirection: asc
    ) {
      blockTimestamp
      shares
      cooldownEnd
    }
  }
`;

export default unstakingQuery;
