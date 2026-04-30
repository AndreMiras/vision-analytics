/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { CycleProgressCard } from "./CycleProgressCard";
import type { ConvertedRewardsCycle } from "@/types/svsn/cycle-events";

const REFERENCE_TIME = new Date("2024-01-01T00:00:00Z");
const REFERENCE_SECONDS = REFERENCE_TIME.getTime() / 1000;

const baseCycle: ConvertedRewardsCycle = {
  id: "cycle-1",
  rewardsCycleAmount: 1_000,
  rewardsCycleEndTimestamp: REFERENCE_SECONDS + 86400 * 2 + 3600 * 5,
  newBpsYieldCapPerSecond: 0.000001,
  blockTimestamp: REFERENCE_SECONDS - 86400,
  transactionHash: "0xcycle",
  duration: 86400 * 3 + 3600 * 5,
  status: "ongoing",
  progressPercent: 33,
  timeRemaining: 86400 * 2 + 3600 * 5,
};

describe("CycleProgressCard", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(REFERENCE_TIME);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders skeletons when loading", () => {
    const { container } = render(
      <CycleProgressCard cycle={baseCycle} loading />,
    );

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons).toHaveLength(2);
    expect(screen.queryByText("In Progress")).not.toBeInTheDocument();
  });

  it("renders the in-progress label, green dot, and remaining time for ongoing cycles", () => {
    const { container } = render(<CycleProgressCard cycle={baseCycle} />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("2d 5h remaining")).toBeInTheDocument();
    expect(container.querySelector(".bg-green-500")).not.toBeNull();
  });

  it("renders the completed label, blue dot, and end date for completed cycles", () => {
    const completedCycle: ConvertedRewardsCycle = {
      ...baseCycle,
      status: "completed",
      progressPercent: 100,
    };
    const expectedDate = new Date(
      completedCycle.rewardsCycleEndTimestamp * 1000,
    ).toLocaleDateString();

    const { container } = render(<CycleProgressCard cycle={completedCycle} />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(container.querySelector(".bg-blue-500")).not.toBeNull();
    expect(screen.getAllByText(expectedDate).length).toBeGreaterThan(0);
  });

  it("renders the upcoming label, yellow dot, and end date for upcoming cycles", () => {
    const upcomingCycle: ConvertedRewardsCycle = {
      ...baseCycle,
      status: "upcoming",
      progressPercent: 0,
    };
    const expectedDate = new Date(
      upcomingCycle.rewardsCycleEndTimestamp * 1000,
    ).toLocaleDateString();

    const { container } = render(<CycleProgressCard cycle={upcomingCycle} />);

    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(container.querySelector(".bg-yellow-500")).not.toBeNull();
    expect(screen.getAllByText(expectedDate).length).toBeGreaterThan(0);
  });

  it("forwards progressPercent to the Progress bar width", () => {
    const { container } = render(
      <CycleProgressCard cycle={{ ...baseCycle, progressPercent: 42 }} />,
    );

    const fill = container.querySelector(".bg-blue-600") as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe("42%");
  });
});
