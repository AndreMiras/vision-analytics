/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TVLMetricCards } from "./TVLMetricCards";

describe("TVLMetricCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders labels and formatted TVL values with a positive change", () => {
    render(
      <TVLMetricCards
        currentTVL={1_234_567}
        tvlChange={12.345}
        allTimeHigh={2_000_000}
        currentPrice={2}
        timeframeDays={30}
      />,
    );

    expect(screen.getByText("Current TVL")).toBeInTheDocument();
    expect(screen.getByText("1.2M VSN")).toBeInTheDocument();
    expect(screen.getByText("$2,469,134")).toBeInTheDocument();
    expect(screen.getByText("30d Change")).toBeInTheDocument();
    expect(screen.getByText("+12.35%")).toBeInTheDocument();
    expect(screen.getByText("All-time High")).toBeInTheDocument();
    expect(screen.getByText("2M VSN")).toBeInTheDocument();
    expect(screen.getByText("$4,000,000")).toBeInTheDocument();
  });

  it("renders negative changes and all-time timeframe labels", () => {
    render(
      <TVLMetricCards
        currentTVL={1000}
        tvlChange={-4.5}
        allTimeHigh={2000}
        currentPrice={1}
        timeframeDays={null}
      />,
    );

    expect(screen.getByText("All-time Change")).toBeInTheDocument();
    expect(screen.getByText("-4.50%")).toBeInTheDocument();
  });

  it("renders loading text for the change metric", () => {
    render(
      <TVLMetricCards
        currentTVL={0}
        tvlChange={0}
        allTimeHigh={0}
        currentPrice={0}
        timeframeDays={1}
        loading
      />,
    );

    expect(screen.getByText("24h Change")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
