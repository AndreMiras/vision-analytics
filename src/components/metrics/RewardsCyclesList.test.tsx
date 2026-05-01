/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { RewardsCycleSummary } from "@/types/api/rewards-cycles";
import type { ConvertedRewardsCycle } from "@/types/svsn/cycle-events";
import { RewardsCyclesList } from "./RewardsCyclesList";

const baseCycle: ConvertedRewardsCycle = {
  id: "cycle-base",
  rewardsCycleAmount: 1_000,
  rewardsCycleEndTimestamp: 1_800_259_200,
  newBpsYieldCapPerSecond: 0.000_001,
  blockTimestamp: 1_799_913_600,
  transactionHash: "0xbase",
  duration: 345_600,
  status: "completed",
  progressPercent: 100,
  timeRemaining: 0,
};

const makeSummary = (
  overrides: Partial<RewardsCycleSummary> & {
    cycle?: Partial<ConvertedRewardsCycle>;
  } = {},
): RewardsCycleSummary => {
  const { cycle: cycleOverrides, ...summaryOverrides } = overrides;
  return {
    cycle: { ...baseCycle, ...cycleOverrides },
    totalDistributed: 250,
    remainingBudget: 750,
    distributionCount: 5,
    averageDistribution: 50,
    utilizationPercent: 25,
    ...summaryOverrides,
  };
};

describe("RewardsCyclesList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the loading skeleton state", () => {
    const { container } = render(
      <RewardsCyclesList cycles={[]} currentPrice={2} loading />,
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
    expect(
      screen.queryByText("No rewards cycles found"),
    ).not.toBeInTheDocument();
  });

  it("renders the empty state", () => {
    render(<RewardsCyclesList cycles={[]} currentPrice={2} />);

    expect(screen.getByText("No rewards cycles found")).toBeInTheDocument();
  });

  it("renders one row per cycle with status, dates, totals, and utilization", () => {
    const summaries = [
      makeSummary({
        cycle: {
          id: "cycle-ongoing",
          status: "ongoing",
          blockTimestamp: 1_799_913_600,
          rewardsCycleEndTimestamp: 1_800_259_200,
          rewardsCycleAmount: 1_000,
        },
        totalDistributed: 250,
        remainingBudget: 750,
        distributionCount: 5,
        utilizationPercent: 25,
      }),
      makeSummary({
        cycle: {
          id: "cycle-completed",
          status: "completed",
          blockTimestamp: 1_799_568_000,
          rewardsCycleEndTimestamp: 1_799_913_600,
          rewardsCycleAmount: 500,
        },
        totalDistributed: 500,
        remainingBudget: 0,
        distributionCount: 1,
        utilizationPercent: 100,
      }),
    ];

    render(<RewardsCyclesList cycles={summaries} currentPrice={2} />);

    expect(screen.getByText("Ongoing")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    const ongoingRow = screen.getByText("Ongoing").closest("div.p-4");
    expect(ongoingRow).not.toBeNull();
    expect(ongoingRow as HTMLElement).toHaveTextContent("25.0%");
    expect(
      within(ongoingRow as HTMLElement).getByText("5 events"),
    ).toBeInTheDocument();
    expect(ongoingRow as HTMLElement).toHaveTextContent(
      "Jan 14, 2027 -> Jan 18, 2027",
    );
    expect(
      within(ongoingRow as HTMLElement).getAllByText("1K VSN"),
    ).toHaveLength(1);
    expect(
      within(ongoingRow as HTMLElement).getByText("$2,000"),
    ).toBeInTheDocument();

    const completedRow = screen.getByText("Completed").closest("div.p-4");
    expect(completedRow).not.toBeNull();
    expect(completedRow as HTMLElement).toHaveTextContent("100.0%");
    expect(completedRow as HTMLElement).toHaveTextContent(
      "Jan 10, 2027 -> Jan 14, 2027",
    );
    expect(
      within(completedRow as HTMLElement).getByText("1 event"),
    ).toBeInTheDocument();
  });
});
