// Base interfaces that are shared across subgraphs
export interface BaseSnapshot {
  id: string;
  timestamp: string;
  blockNumber: string;
}

export interface SubgraphResponse<T> {
  data: T;
}

export type YieldSnapshotsResponse<T> = SubgraphResponse<{
  yieldSnapshots: T[];
}>;
