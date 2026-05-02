/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RewardsCyclesPage from "./page";
import type { CycleProgressCard } from "@/components/metrics/CycleProgressCard";
import type { CycleMetricCards } from "@/components/metrics/CycleMetricCards";
import type { CycleHistoricalComparison } from "@/components/metrics/CycleHistoricalComparison";
import type { DistributionEventsChart } from "@/components/metrics/DistributionEventsChart";
import type { RewardsCyclesList } from "@/components/metrics/RewardsCyclesList";
import type { RewardsCyclesResponse } from "@/types/api/rewards-cycles";

type CycleProgressCardProps = ComponentProps<typeof CycleProgressCard>;
type CycleMetricCardsProps = ComponentProps<typeof CycleMetricCards>;
type CycleHistoricalComparisonProps = ComponentProps<
  typeof CycleHistoricalComparison
>;
type DistributionEventsChartProps = ComponentProps<
  typeof DistributionEventsChart
>;
type RewardsCyclesListProps = ComponentProps<typeof RewardsCyclesList>;

const progressCardSpy = vi.fn();
const metricCardsSpy = vi.fn();
const historicalSpy = vi.fn();
const distributionsSpy = vi.fn();
const rewardsCyclesListSpy = vi.fn();

vi.mock("@/components/metrics/CycleProgressCard", () => ({
  CycleProgressCard: (props: CycleProgressCardProps) => {
    progressCardSpy(props);
    return <div data-testid="cycle-progress-card" />;
  },
}));

vi.mock("@/components/metrics/CycleMetricCards", () => ({
  CycleMetricCards: (props: CycleMetricCardsProps) => {
    metricCardsSpy(props);
    return <div data-testid="cycle-metric-cards" />;
  },
}));

vi.mock("@/components/metrics/CycleHistoricalComparison", () => ({
  CycleHistoricalComparison: (props: CycleHistoricalComparisonProps) => {
    historicalSpy(props);
    return <div data-testid="cycle-historical-comparison" />;
  },
}));

vi.mock("@/components/metrics/DistributionEventsChart", () => ({
  DistributionEventsChart: (props: DistributionEventsChartProps) => {
    distributionsSpy(props);
    return <div data-testid="distribution-events-chart" />;
  },
}));

vi.mock("@/components/metrics/RewardsCyclesList", () => ({
  RewardsCyclesList: (props: RewardsCyclesListProps) => {
    rewardsCyclesListSpy(props);
    return <div data-testid="rewards-cycles-list" />;
  },
}));

const populatedResponse: RewardsCyclesResponse = {
  currentCycle: {
    cycle: {
      id: "cycle-1",
      rewardsCycleAmount: 1_000,
      rewardsCycleEndTimestamp: 1_800_100_000,
      newBpsYieldCapPerSecond: 0.000001,
      blockTimestamp: 1_800_000_000,
      transactionHash: "0xcycle",
      duration: 100_000,
      status: "ongoing",
      progressPercent: 50,
      timeRemaining: 50_000,
    },
    distributions: [
      {
        id: "dist-1",
        timestamp: 1_800_010_000,
        txHash: "0xreward1",
        rewards: 100,
      },
      {
        id: "dist-2",
        timestamp: 1_800_020_000,
        txHash: "0xreward2",
        rewards: 150,
      },
    ],
    totalDistributed: 250,
    remainingBudget: 750,
    distributionCount: 2,
    averageDistribution: 125,
    utilizationPercent: 25,
  },
  historicalAverage: {
    cycleDuration: 90_000,
    totalDistributed: 200,
    distributionCount: 2,
    averageDistribution: 100,
  },
  currentPrice: 0.42,
  cycles: [
    {
      cycle: {
        id: "cycle-1",
        rewardsCycleAmount: 1_000,
        rewardsCycleEndTimestamp: 1_800_100_000,
        newBpsYieldCapPerSecond: 0.000001,
        blockTimestamp: 1_800_000_000,
        transactionHash: "0xcycle",
        duration: 100_000,
        status: "ongoing",
        progressPercent: 50,
        timeRemaining: 50_000,
      },
      totalDistributed: 250,
      remainingBudget: 750,
      distributionCount: 2,
      averageDistribution: 125,
      utilizationPercent: 25,
    },
  ],
};

const jsonResponse = (body: unknown) => ({
  json: vi.fn().mockResolvedValue(body),
});

describe("RewardsCyclesPage", () => {
  beforeEach(() => {
    progressCardSpy.mockClear();
    metricCardsSpy.mockClear();
    historicalSpy.mockClear();
    distributionsSpy.mockClear();
    rewardsCyclesListSpy.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the loading state before the fetch resolves", () => {
    let resolveFetch: ((value: unknown) => void) | undefined;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    render(<RewardsCyclesPage />);

    expect(
      screen.getByTestId("current-rewards-cycle-skeleton"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("distribution-events-skeleton"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("cycle-progress-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cycle-metric-cards")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("cycle-historical-comparison"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("distribution-events-chart"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("rewards-cycles-list")).toBeInTheDocument();
    expect(rewardsCyclesListSpy).toHaveBeenLastCalledWith({
      cycles: [],
      currentPrice: 0,
      loading: true,
    });

    resolveFetch?.(
      jsonResponse({
        data: {
          currentCycle: null,
          historicalAverage: null,
          currentPrice: 0,
          cycles: [],
        },
      }),
    );
  });

  it("renders the no-cycle empty state and cycle summaries when the response has no currentCycle", async () => {
    const cycleSummaries = populatedResponse.cycles;
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: {
          currentCycle: null,
          historicalAverage: null,
          currentPrice: 0.42,
          cycles: cycleSummaries,
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<RewardsCyclesPage />);

    await waitFor(() =>
      expect(screen.getByText("No active cycle found")).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/rewards-cycles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(screen.queryByTestId("cycle-progress-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cycle-metric-cards")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("cycle-historical-comparison"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("distribution-events-chart"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("rewards-cycles-list")).toBeInTheDocument();
    expect(rewardsCyclesListSpy).toHaveBeenLastCalledWith({
      cycles: cycleSummaries,
      currentPrice: 0.42,
      loading: false,
    });
  });

  it("passes populated cycle data to each child section", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ data: populatedResponse })),
    );

    render(<RewardsCyclesPage />);

    await waitFor(() =>
      expect(screen.getByTestId("cycle-progress-card")).toBeInTheDocument(),
    );

    expect(progressCardSpy).toHaveBeenLastCalledWith({
      cycle: populatedResponse.currentCycle!.cycle,
      loading: false,
    });
    expect(metricCardsSpy).toHaveBeenLastCalledWith({
      analytics: populatedResponse.currentCycle,
      currentPrice: 0.42,
      loading: false,
    });
    expect(historicalSpy).toHaveBeenLastCalledWith({
      data: populatedResponse,
      loading: false,
    });
    expect(distributionsSpy).toHaveBeenLastCalledWith({
      distributions: populatedResponse.currentCycle!.distributions,
      loading: false,
    });
    expect(rewardsCyclesListSpy).toHaveBeenLastCalledWith({
      cycles: populatedResponse.cycles,
      currentPrice: 0.42,
      loading: false,
    });
  });

  it("logs failed requests and falls back to the no-cycle state", async () => {
    const error = new Error("network failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    render(<RewardsCyclesPage />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching rewards cycles data:",
        error,
      ),
    );
    expect(screen.getByText("No active cycle found")).toBeInTheDocument();
    expect(rewardsCyclesListSpy).toHaveBeenLastCalledWith({
      cycles: [],
      currentPrice: 0,
      loading: false,
    });
  });
});
