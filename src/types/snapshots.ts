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
  cooldownEnd: string;
  shares: string;
  transactionHash: string;
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

export interface SupplySnapshot {
  id: string;
  totalSupply: string;
  timestamp: string;
  blockNumber: string;
  eventType?: string;
}

export interface StakingSnapshot extends BaseSnapshot {
  totalSupply: string;
}

export interface SupplyOverTimeResponse {
  data: {
    supplySnapshots: SupplySnapshot[];
  };
}

export interface StakingHistoryResponse {
  data: {
    yieldSnapshots: StakingSnapshot[];
  };
}
