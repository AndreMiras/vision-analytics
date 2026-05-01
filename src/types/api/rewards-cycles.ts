import {
  ConvertedRewardsCycle,
  ConvertedDistributeRewardsEvent,
} from "../svsn/cycle-events";

export interface CycleAnalytics {
  cycle: ConvertedRewardsCycle;
  distributions: ConvertedDistributeRewardsEvent[];
  totalDistributed: number;
  remainingBudget: number;
  distributionCount: number;
  averageDistribution: number;
  utilizationPercent: number;
}

export interface RewardsCycleSummary {
  cycle: ConvertedRewardsCycle;
  totalDistributed: number;
  remainingBudget: number;
  distributionCount: number;
  averageDistribution: number;
  utilizationPercent: number;
}

export interface RewardsCyclesResponse {
  currentCycle: CycleAnalytics | null;
  historicalAverage: {
    cycleDuration: number;
    totalDistributed: number;
    distributionCount: number;
    averageDistribution: number;
  } | null;
  currentPrice: number;
  cycles: RewardsCycleSummary[];
}
