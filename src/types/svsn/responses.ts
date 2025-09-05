import { SubgraphResponse } from "../shared/base";
import {
  PerformanceSnapshot,
  TVLSnapshot,
  UnstakingSnapshot,
  YieldSnapshot,
} from "./snapshots";

export type PerformanceSnapshotsResponse = SubgraphResponse<{
  yieldSnapshots: PerformanceSnapshot[];
}>;

export type TVLSnapshotsResponse = SubgraphResponse<{
  yieldSnapshots: TVLSnapshot[];
}>;

export type UnstakingResponse = SubgraphResponse<{
  cooldownStarteds: UnstakingSnapshot[];
}>;

export type StakingHistoryResponse = SubgraphResponse<{
  yieldSnapshots: YieldSnapshot[];
}>;
