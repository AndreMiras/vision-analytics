import { createYieldSnapshotsQuery } from "../shared/builders";

export const performanceQuery = createYieldSnapshotsQuery([
  "id",
  "exchangeRate",
  "timestamp",
]);
