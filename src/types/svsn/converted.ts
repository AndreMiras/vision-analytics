export interface ConvertedYieldSnapshot {
  totalSupply: number;
  totalAssets: number;
  exchangeRate: number;
}

export interface ConvertedPerformanceSnapshot {
  timestamp: number;
  exchangeRate: number;
}

export interface ConvertedTVLSnapshot {
  timestamp: number;
  totalAssets: number;
  totalSupply: number;
}

export interface ConvertedUnstakingSnapshot {
  blockTimestamp: number;
  cooldownEnd: number;
  shares: number;
  transactionHash: string;
}
