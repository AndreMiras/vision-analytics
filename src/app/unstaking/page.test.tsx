/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UnstakingPage from "./page";
import type { UnstakingChart } from "@/components/metrics/UnstakingChart";
import type { UnstakingList } from "@/components/metrics/UnstakingList";
import type { UnstakingMetricCards } from "@/components/metrics/UnstakingMetricCards";
import type { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";

type UnstakingMetricCardsProps = ComponentProps<typeof UnstakingMetricCards>;
type UnstakingChartProps = ComponentProps<typeof UnstakingChart>;
type UnstakingListProps = ComponentProps<typeof UnstakingList>;

const metricCardsSpy = vi.fn();
const chartSpy = vi.fn();
const listSpy = vi.fn();

vi.mock("@/components/metrics/UnstakingMetricCards", () => ({
  UnstakingMetricCards: (props: UnstakingMetricCardsProps) => {
    metricCardsSpy(props);
    return (
      <div data-testid="unstaking-metric-cards">{JSON.stringify(props)}</div>
    );
  },
}));

vi.mock("@/components/metrics/UnstakingChart", () => ({
  UnstakingChart: (props: UnstakingChartProps) => {
    chartSpy(props);
    return <div data-testid="unstaking-chart">{JSON.stringify(props)}</div>;
  },
}));

vi.mock("@/components/metrics/UnstakingList", () => ({
  UnstakingList: (props: UnstakingListProps) => {
    listSpy(props);
    return <div data-testid="unstaking-list">{JSON.stringify(props)}</div>;
  },
}));

const snapshots: ConvertedUnstakingSnapshot[] = [
  {
    blockTimestamp: 1_800_000_000,
    cooldownEnd: 1_800_010_000,
    shares: 100,
    transactionHash: "0x1111111111111111111111111111111111111111",
  },
  {
    blockTimestamp: 1_800_000_100,
    cooldownEnd: 1_800_100_000,
    shares: 200,
    transactionHash: "0x2222222222222222222222222222222222222222",
  },
  {
    blockTimestamp: 1_799_000_000,
    cooldownEnd: 1_799_000_001,
    shares: 999,
    transactionHash: "0x3333333333333333333333333333333333333333",
  },
];

const longSnapshots = Array.from({ length: 12 }, (_, index) => ({
  blockTimestamp: 1_800_000_000 + index,
  cooldownEnd: 1_800_010_000 + index,
  shares: index + 1,
  transactionHash: `0x${index.toString().padStart(40, "0")}`,
}));

const latestMetricCardsProps = () =>
  metricCardsSpy.mock.lastCall?.[0] as UnstakingMetricCardsProps;

const latestChartProps = () =>
  chartSpy.mock.lastCall?.[0] as UnstakingChartProps;

const latestListProps = () => listSpy.mock.lastCall?.[0] as UnstakingListProps;

describe("UnstakingPage", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2027-01-15T00:00:00.000Z").getTime(),
    );
    metricCardsSpy.mockClear();
    chartSpy.mockClear();
    listSpy.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts to the unstaking API and passes derived data to child sections", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        data: {
          unstakingSnapshots: snapshots,
          currentPrice: 2,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<UnstakingPage />);

    expect(
      screen.getByText("Pending Unstaking (Cooldown)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Upcoming Unlocks")).toBeInTheDocument();

    expect(screen.getByTestId("unstaking-metric-cards")).toHaveTextContent(
      '"loading":true',
    );
    expect(latestMetricCardsProps()).toEqual({
      currentPrice: 0,
      totalPending: 0,
      activeCooldowns: 0,
      nextUnlock: null,
      loading: true,
    });
    expect(latestChartProps()).toEqual({
      currentPrice: 0,
      data: [],
      loading: true,
    });
    expect(latestListProps()).toEqual({
      currentPrice: 0,
      data: [],
      loading: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/unstaking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    await waitFor(() =>
      expect(latestMetricCardsProps()).toMatchObject({
        currentPrice: 2,
        totalPending: 300,
        activeCooldowns: 2,
        nextUnlock: 1_800_010_000,
        loading: false,
      }),
    );
    expect(latestChartProps()).toEqual({
      currentPrice: 2,
      data: [
        {
          date: "2027-01-15",
          amount: 100,
          timestamp: 1_799_971_200,
        },
        {
          date: "2027-01-16",
          amount: 200,
          timestamp: 1_800_057_600,
        },
      ],
      loading: false,
    });
    expect(latestListProps()).toEqual({
      currentPrice: 2,
      data: snapshots.slice(0, 2),
      loading: false,
    });
  });

  it("passes only the first ten pending cooldowns to the list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          data: {
            unstakingSnapshots: longSnapshots,
            currentPrice: 3,
          },
        }),
      }),
    );

    render(<UnstakingPage />);

    await waitFor(() =>
      expect(latestListProps()).toMatchObject({
        currentPrice: 3,
        loading: false,
      }),
    );
    expect(latestListProps().data).toEqual(longSnapshots.slice(0, 10));
  });

  it("logs failed requests and keeps empty default child props", async () => {
    const error = new Error("network failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    render(<UnstakingPage />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching unstaking data:",
        error,
      ),
    );
    await waitFor(() =>
      expect(latestMetricCardsProps()).toEqual({
        currentPrice: 0,
        totalPending: 0,
        activeCooldowns: 0,
        nextUnlock: null,
        loading: false,
      }),
    );
    expect(latestChartProps()).toEqual({
      currentPrice: 0,
      data: [],
      loading: false,
    });
    expect(latestListProps()).toEqual({
      currentPrice: 0,
      data: [],
      loading: false,
    });
  });
});
