/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CycleMetricCards } from "./CycleMetricCards";
import type { CycleAnalytics } from "@/types/api/rewards-cycles";

const analytics: CycleAnalytics = {
  cycle: {
    id: "cycle-1",
    rewardsCycleAmount: 1_000_000,
    rewardsCycleEndTimestamp: 2_000_000,
    newBpsYieldCapPerSecond: 0.000001,
    blockTimestamp: 1_000_000,
    transactionHash: "0xcycle",
    duration: 100_000,
    status: "ongoing",
    progressPercent: 25,
    timeRemaining: 75_000,
  },
  distributions: [],
  totalDistributed: 250_000,
  remainingBudget: 750_000,
  distributionCount: 5,
  averageDistribution: 50_000,
  utilizationPercent: 12.345,
};

describe("CycleMetricCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders labels, formatted token amounts, and USD values", () => {
    render(<CycleMetricCards analytics={analytics} currentPrice={0.5} />);

    expect(screen.getByText("Total Allocated")).toBeInTheDocument();
    expect(screen.getByText("Total Distributed")).toBeInTheDocument();
    expect(screen.getByText("Remaining Budget")).toBeInTheDocument();
    expect(screen.getByText("Distribution Events")).toBeInTheDocument();

    expect(screen.getByText("1M VSN")).toBeInTheDocument();
    expect(screen.getByText("$500,000")).toBeInTheDocument();
    expect(screen.getByText("250K VSN")).toBeInTheDocument();
    expect(screen.getByText("$125,000")).toBeInTheDocument();
    expect(screen.getByText("750K VSN")).toBeInTheDocument();
    expect(screen.getByText("$375,000")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("12.3% utilized")).toBeInTheDocument();
  });

  it("renders Loading... placeholders for token cards while loading", () => {
    render(
      <CycleMetricCards analytics={analytics} currentPrice={0.5} loading />,
    );

    expect(screen.getAllByText("Loading...")).toHaveLength(3);
    expect(screen.queryByText("$500,000")).not.toBeInTheDocument();
    expect(screen.queryByText("$125,000")).not.toBeInTheDocument();
    expect(screen.queryByText("$375,000")).not.toBeInTheDocument();
    expect(screen.getByText("12.3% utilized")).toBeInTheDocument();
  });
});
