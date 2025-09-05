export interface StakingRatioDataPoint {
  timestamp: number;
  date: string;
  stakingRatio: number;
  totalSupply: number;
  stakedAmount: number;
  unstakedAmount: number;
}

export interface StakingOverview {
  totalSupply: number;
  stakedAmount: number;
  unstakedAmount: number;
  stakingRatio: number;
  lastUpdated: number;
}
