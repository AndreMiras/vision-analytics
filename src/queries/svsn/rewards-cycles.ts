export const rewardsCyclesQuery = `
  query getRewardsCycles($skip: Int = 0) {
    rewardsCycleCreateds(
      first: 1000
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      rewardsCycleAmount
      rewardsCycleEndTimestamp
      newBpsYieldCapPerSecond
      blockTimestamp
      transactionHash
    }
  }
`;

export const distributeRewardsQuery = `
  query getDistributeRewards($skip: Int = 0, $startTime: BigInt) {
    distributeRewards_collection(
      first: 1000
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: asc
      where: { blockTimestamp_gte: $startTime }
    ) {
      id
      rewards
      blockTimestamp
      transactionHash
    }
  }
`;
