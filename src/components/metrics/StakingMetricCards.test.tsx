/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StakingMetricCards } from "./StakingMetricCards";

describe("StakingMetricCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders labels and formatted staking values", () => {
    render(
      <StakingMetricCards
        currentPrice={2}
        totalVision={1_000_000}
        stakedVision={250_000}
        unstakedVision={750_000}
        stakingRatio={25}
      />,
    );

    expect(screen.getByText("Total VISION Supply")).toBeInTheDocument();
    expect(screen.getByText("1M VSN")).toBeInTheDocument();
    expect(screen.getByText("$2,000,000")).toBeInTheDocument();
    expect(screen.getByText("Currently Staked")).toBeInTheDocument();
    expect(screen.getByText("250K sVSN")).toBeInTheDocument();
    expect(screen.getByText("$500,000")).toBeInTheDocument();
    expect(screen.getByText("Available to Stake")).toBeInTheDocument();
    expect(screen.getByText("750K VSN")).toBeInTheDocument();
    expect(screen.getByText("$1,500,000")).toBeInTheDocument();
    expect(screen.getByText("Staking Ratio")).toBeInTheDocument();
    expect(screen.getByText("25.00%")).toBeInTheDocument();
  });

  it("renders loading text where staking values are pending", () => {
    render(
      <StakingMetricCards
        currentPrice={0}
        totalVision={0}
        stakedVision={0}
        unstakedVision={0}
        stakingRatio={0}
        loading
      />,
    );

    expect(screen.getAllByText("Loading... VSN")).toHaveLength(2);
    expect(screen.getByText("Loading... sVSN")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
