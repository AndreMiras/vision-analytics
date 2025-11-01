import { BaseSnapshot } from "../shared/base";

// Raw GraphQL response types (string values from subgraph)
export interface RewardsCycleCreated extends BaseSnapshot {
  id: string;
  rewardsCycleAmount: string;
  rewardsCycleEndTimestamp: string;
  newBpsYieldCapPerSecond: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface DistributeRewardsEvent {
  id: string;
  rewards: string;
  blockTimestamp: string;
  transactionHash: string;
}

// Converted types (numeric values, ready for display)
export interface ConvertedRewardsCycle {
  id: string;
  rewardsCycleAmount: number;
  rewardsCycleEndTimestamp: number;
  newBpsYieldCapPerSecond: number;
  blockTimestamp: number;
  transactionHash: string;
  // Computed fields
  duration: number; // seconds
  status: "ongoing" | "completed" | "upcoming";
  progressPercent: number; // 0-100
  timeRemaining: number; // seconds, 0 if completed
}

export interface ConvertedDistributeRewardsEvent {
  id: string;
  timestamp: number;
  txHash: string;
  rewards: number; // Exact DistributeRewards.rewards amount from the subgraph
}
