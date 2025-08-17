export interface BaseSnapshot {
  timestamp: string;
}

export interface PerformanceSnapshot extends BaseSnapshot {
  exchangeRate: string;
}

export interface TVLSnapshot extends BaseSnapshot {
  totalAssets: string;
  totalSupply: string;
}

export interface UnstakingSnapshot {
  blockTimestamp: string;
  shares: string;
  cooldownEnd: string;
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
}
