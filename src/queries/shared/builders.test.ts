import {
  createSupplySnapshotsQuery,
  createYieldSnapshotsQuery,
} from "@/queries/shared/builders";
import { describe, expect, it } from "vitest";

const normalizeQuery = (query: string) => query.replace(/\s+/g, " ").trim();

describe("shared query builders", () => {
  describe("createYieldSnapshotsQuery", () => {
    it("includes required variables, paging, ordering, timestamp lower bound, and fields", () => {
      const query = normalizeQuery(
        createYieldSnapshotsQuery(["timestamp", "totalAssets", "exchangeRate"]),
      );

      expect(query).toContain(
        "query getYieldSnapshots($startTime: BigInt!, $skip: Int = 0)",
      );
      expect(query).toContain("yieldSnapshots(");
      expect(query).toContain("first: 1000");
      expect(query).toContain("skip: $skip");
      expect(query).toContain("orderBy: timestamp");
      expect(query).toContain("orderDirection: asc");
      expect(query).toContain("where: { timestamp_gt: $startTime }");
      expect(query).toContain("timestamp totalAssets exchangeRate");
      expect(query).not.toContain("timestamp_lte");
      expect(query).not.toContain("$endTime");
    });

    it("includes endTime and timestamp upper bound only when timeRange is enabled", () => {
      const query = normalizeQuery(
        createYieldSnapshotsQuery(["timestamp"], true),
      );

      expect(query).toContain(
        "query getYieldSnapshots($startTime: BigInt!, $endTime: BigInt!, $skip: Int = 0)",
      );
      expect(query).toContain(
        "where: { timestamp_gt: $startTime timestamp_lte: $endTime }",
      );
    });
  });

  describe("createSupplySnapshotsQuery", () => {
    it("uses supplySnapshots and timestamp_gte", () => {
      const query = normalizeQuery(
        createSupplySnapshotsQuery(["timestamp", "totalSupply"]),
      );

      expect(query).toContain(
        "query getSupplySnapshots($startTime: BigInt!, $skip: Int = 0)",
      );
      expect(query).toContain("supplySnapshots(");
      expect(query).toContain("where: { timestamp_gte: $startTime }");
      expect(query).toContain("timestamp totalSupply");
      expect(query).not.toContain("timestamp_gt:");
      expect(query).not.toContain("timestamp_lte");
    });
  });
});
