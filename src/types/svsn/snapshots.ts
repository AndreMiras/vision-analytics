import { BaseSnapshot } from "../shared/base";

export interface YieldSnapshot extends BaseSnapshot {
  totalSupply: string;
  totalAssets: string;
  exchangeRate: string;
}

export interface PerformanceSnapshot extends BaseSnapshot {
  exchangeRate: string;
}

export interface TVLSnapshot extends BaseSnapshot {
  totalAssets: string;
  totalSupply: string;
}

export interface UnstakingSnapshot extends BaseSnapshot {
  blockTimestamp: string;
  cooldownEnd: string;
  shares: string;
  transactionHash: string;
}
