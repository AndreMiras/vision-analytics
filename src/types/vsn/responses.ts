import { SubgraphResponse } from "../shared/base";
import { SupplySnapshot } from "./snapshots";

export type SupplySnapshotsResponse = SubgraphResponse<{
  supplySnapshots: SupplySnapshot[];
}>;

export type LatestSupplyResponse = SubgraphResponse<{
  supplySnapshots: SupplySnapshot[];
}>;

export type SupplyOverTimeResponse = SubgraphResponse<{
  supplySnapshots: SupplySnapshot[];
}>;
