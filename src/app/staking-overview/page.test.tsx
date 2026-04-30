/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StakingOverviewPage from "./page";
import type { HistoricalStakingRatioChart } from "@/components/metrics/HistoricalStakingRatioChart";
import type { StakingChart } from "@/components/metrics/StakingChart";
import type { StakingMetricCards } from "@/components/metrics/StakingMetricCards";
import type { StakingRatioDataPoint } from "@/types/api/staking";

type StakingMetricCardsProps = ComponentProps<typeof StakingMetricCards>;
type StakingChartProps = ComponentProps<typeof StakingChart>;
type HistoricalStakingRatioChartProps = ComponentProps<
  typeof HistoricalStakingRatioChart
>;

const metricCardsSpy = vi.fn();
const stakingChartSpy = vi.fn();
const historicalChartSpy = vi.fn();

vi.mock("@/components/metrics/StakingMetricCards", () => ({
  StakingMetricCards: (props: StakingMetricCardsProps) => {
    metricCardsSpy(props);
    return (
      <div data-testid="staking-metric-cards">{JSON.stringify(props)}</div>
    );
  },
}));

vi.mock("@/components/metrics/StakingChart", () => ({
  StakingChart: (props: StakingChartProps) => {
    stakingChartSpy(props);
    return <div data-testid="staking-chart">{JSON.stringify(props)}</div>;
  },
}));

vi.mock("@/components/metrics/HistoricalStakingRatioChart", () => ({
  HistoricalStakingRatioChart: (props: HistoricalStakingRatioChartProps) => {
    historicalChartSpy(props);
    return (
      <div data-testid="historical-staking-ratio-chart">
        {JSON.stringify(props)}
      </div>
    );
  },
}));

const historyData: StakingRatioDataPoint[] = [
  {
    timestamp: 1_800_000_000,
    date: "2027-01-15",
    totalSupply: 1000,
    stakedAmount: 200,
    stakedPercent: 0.2,
    unstakedAmount: 800,
    unstakedPercent: 0.8,
  },
  {
    timestamp: 1_800_086_400,
    date: "2027-01-16",
    totalSupply: 1000,
    stakedAmount: 250,
    stakedPercent: 0.25,
    unstakedAmount: 750,
    unstakedPercent: 0.75,
  },
];

const latestMetricCardsProps = () =>
  metricCardsSpy.mock.lastCall?.[0] as StakingMetricCardsProps;

const latestStakingChartProps = () =>
  stakingChartSpy.mock.lastCall?.[0] as StakingChartProps;

const latestHistoricalChartProps = () =>
  historicalChartSpy.mock.lastCall?.[0] as HistoricalStakingRatioChartProps;

const overviewResponse = () => ({
  json: vi.fn().mockResolvedValue({
    data: {
      totalVisionSupply: 1000,
      stakedVision: 250,
      currentPrice: 2,
    },
  }),
});

const historyResponse = () => ({
  json: vi.fn().mockResolvedValue({
    data: historyData,
  }),
});

describe("StakingOverviewPage", () => {
  beforeEach(() => {
    metricCardsSpy.mockClear();
    stakingChartSpy.mockClear();
    historicalChartSpy.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts staking overview requests and passes derived data to child sections", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(overviewResponse())
      .mockResolvedValueOnce(historyResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<StakingOverviewPage />);

    expect(screen.getByText("VISION Staking Overview")).toBeInTheDocument();
    expect(screen.getByText("Current Staking Ratio")).toBeInTheDocument();
    expect(screen.getByText("Staking Ratio Over Time")).toBeInTheDocument();

    expect(screen.getByTestId("staking-metric-cards")).toHaveTextContent(
      '"loading":true',
    );
    expect(latestMetricCardsProps()).toEqual({
      currentPrice: 0,
      totalVision: 0,
      stakedVision: 0,
      unstakedVision: 0,
      stakingRatio: 0,
      loading: true,
    });
    expect(latestStakingChartProps()).toEqual({
      stakedVision: 0,
      unstakedVision: 0,
      currentPrice: 0,
      loading: true,
    });
    expect(latestHistoricalChartProps()).toEqual({
      data: [],
      loading: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenCalledWith("/api/staking-overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/staking-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysBack: 30 }),
    });

    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        currentPrice: 2,
        totalVision: 1000,
        stakedVision: 250,
        unstakedVision: 750,
        stakingRatio: 25,
        loading: false,
      }),
    );
    expect(latestStakingChartProps()).toEqual({
      stakedVision: 250,
      unstakedVision: 750,
      currentPrice: 2,
      loading: false,
    });
    expect(latestHistoricalChartProps()).toEqual({
      data: historyData,
      loading: false,
    });
  });

  it("logs history failures without masking fetched overview data", async () => {
    const historyError = new Error("history failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const fetchMock = vi.fn((url: string | URL | Request) => {
      if (url === "/api/staking-history") {
        return Promise.reject(historyError);
      }

      return Promise.resolve(overviewResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<StakingOverviewPage />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching staking history data:",
        historyError,
      ),
    );
    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        currentPrice: 2,
        totalVision: 1000,
        stakedVision: 250,
        unstakedVision: 750,
        stakingRatio: 25,
        loading: false,
      }),
    );
    expect(latestStakingChartProps()).toEqual({
      stakedVision: 250,
      unstakedVision: 750,
      currentPrice: 2,
      loading: false,
    });
    expect(latestHistoricalChartProps()).toEqual({
      data: [],
      loading: false,
    });
  });

  it("logs overview failures while still rendering the history data", async () => {
    const overviewError = new Error("overview failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const fetchMock = vi.fn((url: string | URL | Request) => {
      if (url === "/api/staking-overview") {
        return Promise.reject(overviewError);
      }

      return Promise.resolve(historyResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<StakingOverviewPage />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching staking overview data:",
        overviewError,
      ),
    );
    await waitFor(() =>
      expect(latestHistoricalChartProps()).toEqual({
        data: historyData,
        loading: false,
      }),
    );
    expect(latestMetricCardsProps()).toEqual({
      currentPrice: 0,
      totalVision: 0,
      stakedVision: 0,
      unstakedVision: 0,
      stakingRatio: 0,
      loading: false,
    });
  });

  it("falls back to an empty history when the response omits data", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      if (url === "/api/staking-history") {
        return Promise.resolve({
          json: vi.fn().mockResolvedValue({}),
        });
      }

      return Promise.resolve(overviewResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<StakingOverviewPage />);

    await waitFor(() =>
      expect(latestHistoricalChartProps()).toEqual({
        data: [],
        loading: false,
      }),
    );
  });
});
