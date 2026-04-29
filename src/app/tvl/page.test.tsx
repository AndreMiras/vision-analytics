/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TVLPage from "./page";
import type { TVLChart } from "@/components/metrics/TVLChart";
import type { TVLMetricCards } from "@/components/metrics/TVLMetricCards";
import type { ConvertedTVLSnapshot } from "@/types/svsn/converted";

type TVLMetricCardsProps = ComponentProps<typeof TVLMetricCards>;
type TVLChartProps = ComponentProps<typeof TVLChart>;

const metricCardsSpy = vi.fn();
const chartSpy = vi.fn();

vi.mock("@/components/metrics/TVLMetricCards", () => ({
  TVLMetricCards: (props: TVLMetricCardsProps) => {
    metricCardsSpy(props);
    return <div data-testid="tvl-metric-cards">{JSON.stringify(props)}</div>;
  },
}));

vi.mock("@/components/metrics/TVLChart", () => ({
  TVLChart: (props: TVLChartProps) => {
    chartSpy(props);
    return <div data-testid="tvl-chart">{JSON.stringify(props)}</div>;
  },
}));

const defaultSnapshots: ConvertedTVLSnapshot[] = [
  {
    timestamp: 1_800_000_000,
    totalAssets: 100,
    totalSupply: 90,
  },
  {
    timestamp: 1_800_086_400,
    totalAssets: 150,
    totalSupply: 120,
  },
  {
    timestamp: 1_800_172_800,
    totalAssets: 125,
    totalSupply: 110,
  },
];

const sevenDaySnapshots: ConvertedTVLSnapshot[] = [
  {
    timestamp: 1_800_000_000,
    totalAssets: 200,
    totalSupply: 150,
  },
  {
    timestamp: 1_800_086_400,
    totalAssets: 250,
    totalSupply: 175,
  },
];

const latestMetricCardsProps = () =>
  metricCardsSpy.mock.lastCall?.[0] as TVLMetricCardsProps;

const latestChartProps = () => chartSpy.mock.lastCall?.[0] as TVLChartProps;

const metricsResponse = (
  yieldSnapshots: ConvertedTVLSnapshot[],
  currentPrice: number,
) => ({
  json: vi.fn().mockResolvedValue({
    data: {
      yieldSnapshots,
      currentPrice,
    },
  }),
});

describe("TVLPage", () => {
  beforeEach(() => {
    Object.defineProperties(HTMLElement.prototype, {
      hasPointerCapture: {
        configurable: true,
        value: vi.fn().mockReturnValue(false),
      },
      releasePointerCapture: {
        configurable: true,
        value: vi.fn(),
      },
      scrollIntoView: {
        configurable: true,
        value: vi.fn(),
      },
    });
    metricCardsSpy.mockClear();
    chartSpy.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts the default metrics request and passes derived data to child sections", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(metricsResponse(defaultSnapshots, 4));
    vi.stubGlobal("fetch", fetchMock);

    render(<TVLPage />);

    expect(screen.getByText("Total Value Locked (TVL)")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("30 days");
    expect(screen.getByTestId("tvl-metric-cards")).toHaveTextContent(
      '"loading":true',
    );
    expect(latestMetricCardsProps()).toEqual({
      currentTVL: 0,
      tvlChange: 0,
      allTimeHigh: -Infinity,
      currentPrice: 0,
      timeframeDays: 30,
      loading: true,
    });
    expect(latestChartProps()).toEqual({
      currentPrice: 0,
      tvlSnapshots: [],
      loading: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeframe: "30",
        type: "tvl",
      }),
    });

    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        currentTVL: 125,
        tvlChange: 25,
        allTimeHigh: 150,
        currentPrice: 4,
        timeframeDays: 30,
        loading: false,
      }),
    );
    expect(latestChartProps()).toEqual({
      currentPrice: 4,
      tvlSnapshots: defaultSnapshots,
      loading: false,
    });
  });

  it("requests the selected timeframe through the visible select control", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(metricsResponse(defaultSnapshots, 4))
      .mockResolvedValueOnce(metricsResponse(sevenDaySnapshots, 5));
    vi.stubGlobal("fetch", fetchMock);

    render(<TVLPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "7 days" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeframe: "7",
        type: "tvl",
      }),
    });

    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        currentTVL: 250,
        tvlChange: 25,
        allTimeHigh: 250,
        currentPrice: 5,
        timeframeDays: 7,
        loading: false,
      }),
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("7 days");
  });

  it("logs failed requests and keeps empty default child props", async () => {
    const error = new Error("network failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    render(<TVLPage />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching TVL data:",
        error,
      ),
    );
    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        currentTVL: 0,
        tvlChange: 0,
        allTimeHigh: -Infinity,
        currentPrice: 0,
        timeframeDays: 30,
        loading: false,
      }),
    );
    expect(latestChartProps()).toEqual({
      currentPrice: 0,
      tvlSnapshots: [],
      loading: false,
    });
  });
});
