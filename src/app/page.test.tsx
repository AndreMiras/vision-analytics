/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import type { MetricCards } from "@/components/metrics/MetricCards";
import type { PerformanceChart } from "@/components/metrics/PerformanceChart";
import type { ConvertedPerformanceSnapshot } from "@/types/svsn/converted";
import { calculateCurrentAPY } from "@/utils/apy";

type MetricCardsProps = ComponentProps<typeof MetricCards>;
type PerformanceChartProps = ComponentProps<typeof PerformanceChart>;

const metricCardsSpy = vi.fn();
const chartSpy = vi.fn();

vi.mock("@/components/metrics/MetricCards", () => ({
  MetricCards: (props: MetricCardsProps) => {
    metricCardsSpy(props);
    return <div data-testid="metric-cards">{JSON.stringify(props)}</div>;
  },
}));

vi.mock("@/components/metrics/PerformanceChart", () => ({
  PerformanceChart: (props: PerformanceChartProps) => {
    chartSpy(props);
    return <div data-testid="performance-chart">{JSON.stringify(props)}</div>;
  },
}));

const defaultSnapshots: ConvertedPerformanceSnapshot[] = [
  { timestamp: 1_800_000_000, exchangeRate: 1.0 },
  { timestamp: 1_800_086_400, exchangeRate: 1.05 },
  { timestamp: 1_800_172_800, exchangeRate: 1.08 },
];

const sevenDaySnapshots: ConvertedPerformanceSnapshot[] = [
  { timestamp: 1_800_000_000, exchangeRate: 1.0 },
  { timestamp: 1_800_604_800, exchangeRate: 1.02 },
];

const latestMetricCardsProps = () =>
  metricCardsSpy.mock.lastCall?.[0] as MetricCardsProps;

const latestChartProps = () =>
  chartSpy.mock.lastCall?.[0] as PerformanceChartProps;

const metricsResponse = (yieldSnapshots: ConvertedPerformanceSnapshot[]) => ({
  json: vi.fn().mockResolvedValue({
    data: { yieldSnapshots },
  }),
});

describe("Home (sVSN performance page)", () => {
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
      .mockResolvedValue(metricsResponse(defaultSnapshots));
    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);

    expect(screen.getByText("sVSN performance vs VSN")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("30 days");
    expect(latestMetricCardsProps()).toEqual({
      exchangeRate: NaN,
      apy: null,
    });
    expect(latestChartProps()).toEqual({ data: [] });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe: "30" }),
    });

    const expectedAPY = calculateCurrentAPY(defaultSnapshots);
    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        exchangeRate: 1.08,
        apy: expectedAPY,
      }),
    );
    expect(latestChartProps()).toEqual({ data: defaultSnapshots });
  });

  it("requests the selected timeframe through the visible select control", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(metricsResponse(defaultSnapshots))
      .mockResolvedValueOnce(metricsResponse(sevenDaySnapshots));
    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "7 days" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeframe: "7" }),
    });
    expect(screen.getByRole("combobox")).toHaveTextContent("7 days");

    const expectedAPY = calculateCurrentAPY(sevenDaySnapshots);
    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        exchangeRate: 1.02,
        apy: expectedAPY,
      }),
    );
  });

  it("logs failed requests and keeps empty default child props", async () => {
    const error = new Error("network failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    render(<Home />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching data:",
        error,
      ),
    );
    expect(latestMetricCardsProps()).toEqual({ exchangeRate: NaN, apy: null });
    expect(latestChartProps()).toEqual({ data: [] });
  });
});
