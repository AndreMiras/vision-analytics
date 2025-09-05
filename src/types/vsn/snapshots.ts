import { BaseSnapshot } from "../shared/base";

export interface SupplySnapshot extends BaseSnapshot {
  totalSupply: string;
  eventType?: string;
}
