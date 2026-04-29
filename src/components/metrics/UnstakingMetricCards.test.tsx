/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UnstakingMetricCards } from "./UnstakingMetricCards";

describe("UnstakingMetricCards", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders labels and formatted unstaking values", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-15T08:00:00.000Z"));

    render(
      <UnstakingMetricCards
        currentPrice={2}
        totalPending={1234}
        activeCooldowns={3}
        nextUnlock={1_800_086_400}
      />,
    );

    expect(screen.getByText("Total Pending")).toBeInTheDocument();
    expect(screen.getByText("1.2K sVSN")).toBeInTheDocument();
    expect(screen.getByText("$2,468")).toBeInTheDocument();
    expect(screen.getByText("Active Cooldowns")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Next Unlock")).toBeInTheDocument();
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("renders loading text and an empty next unlock fallback", () => {
    const { rerender } = render(
      <UnstakingMetricCards
        currentPrice={0}
        totalPending={0}
        activeCooldowns={0}
        nextUnlock={null}
        loading
      />,
    );

    expect(screen.getByText("Loading... sVSN")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    rerender(
      <UnstakingMetricCards
        currentPrice={0}
        totalPending={0}
        activeCooldowns={0}
        nextUnlock={null}
      />,
    );

    expect(screen.getByText("None")).toBeInTheDocument();
  });
});
