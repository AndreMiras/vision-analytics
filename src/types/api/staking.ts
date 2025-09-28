export interface StakingRatioDataPoint {
  timestamp: number;
  date: string;
  totalSupply: number;
  stakedAmount: number;
  stakedPercent: number;
  unstakedAmount: number;
  unstakedPercent: number;
}

export interface StakingOverview {
  totalSupply: number;
  stakedAmount: number;
  unstakedAmount: number;
  stakingRatio: number;
  lastUpdated: number;
}
