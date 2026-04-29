/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the value, secondary value, and label", () => {
    render(
      <MetricCard
        value="1.2M VSN"
        secondaryValue="$2,400,000"
        label="Current TVL"
      />,
    );

    expect(screen.getByText("1.2M VSN")).toBeInTheDocument();
    expect(screen.getByText("$2,400,000")).toBeInTheDocument();
    expect(screen.getByText("Current TVL")).toBeInTheDocument();
  });

  it("omits the secondary value when it is not provided", () => {
    render(<MetricCard value="25.00%" label="Staking Ratio" />);

    expect(screen.getByText("25.00%")).toBeInTheDocument();
    expect(screen.getByText("Staking Ratio")).toBeInTheDocument();
    expect(screen.queryByText("$2,400,000")).not.toBeInTheDocument();
  });
});
