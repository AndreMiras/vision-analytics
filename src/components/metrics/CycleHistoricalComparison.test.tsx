/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CycleHistoricalComparison } from "./CycleHistoricalComparison";
import type { RewardsCyclesResponse } from "@/types/api/rewards-cycles";

const populated: RewardsCyclesResponse = {
  currentCycle: {
    cycle: {
      id: "cycle-1",
      rewardsCycleAmount: 1_000,
      rewardsCycleEndTimestamp: 2_000,
      newBpsYieldCapPerSecond: 0.000001,
      blockTimestamp: 1_000,
      transactionHash: "0xcycle",
      duration: 86400 * 3 + 3600 * 2,
      status: "ongoing",
      progressPercent: 50,
      timeRemaining: 0,
    },
    distributions: [],
    totalDistributed: 300,
    remainingBudget: 700,
    distributionCount: 2,
    averageDistribution: 150,
    utilizationPercent: 30,
  },
  historicalAverage: {
    cycleDuration: 86400 * 3,
    totalDistributed: 200,
    distributionCount: 2,
    averageDistribution: 100,
  },
  currentPrice: 0.42,
};

describe("CycleHistoricalComparison", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing while loading", () => {
    const { container } = render(
      <CycleHistoricalComparison data={populated} loading />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when currentCycle is missing", () => {
    const { container } = render(
      <CycleHistoricalComparison data={{ ...populated, currentCycle: null }} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when historicalAverage is missing", () => {
    const { container } = render(
      <CycleHistoricalComparison
        data={{ ...populated, historicalAverage: null }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders heading, duration diff, and distribution diff for populated data", () => {
    render(<CycleHistoricalComparison data={populated} />);

    expect(
      screen.getByText("Comparison to Historical Average"),
    ).toBeInTheDocument();
    expect(screen.getByText("Current Cycle Duration")).toBeInTheDocument();
    expect(screen.getByText("Current Distribution")).toBeInTheDocument();
    expect(screen.getByText("3d 2h")).toBeInTheDocument();
    expect(screen.getByText("2.8% vs avg")).toBeInTheDocument();
    expect(screen.getByText("300 VSN")).toBeInTheDocument();
    expect(screen.getByText("50.0% vs avg")).toBeInTheDocument();
  });

  it("falls back to 'No historical avg' when historical averages are zero", () => {
    render(
      <CycleHistoricalComparison
        data={{
          ...populated,
          historicalAverage: {
            cycleDuration: 0,
            totalDistributed: 0,
            distributionCount: 0,
            averageDistribution: 0,
          },
        }}
      />,
    );

    expect(screen.getAllByText("No historical avg")).toHaveLength(2);
  });
});
