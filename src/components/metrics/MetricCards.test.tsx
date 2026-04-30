/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MetricCards } from "./MetricCards";

describe("MetricCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the formatted exchange rate and APY", () => {
    render(<MetricCards exchangeRate={1.234567} apy={12.345} />);

    expect(screen.getByText("1.2346 VSN")).toBeInTheDocument();
    expect(screen.getByText("12.35%")).toBeInTheDocument();
    expect(screen.getByText("Current Exchange Rate")).toBeInTheDocument();
    expect(screen.getByText("Current APY")).toBeInTheDocument();
  });

  it("renders a dash when APY is null", () => {
    render(<MetricCards exchangeRate={1} apy={null} />);

    expect(screen.getByText("1.0000 VSN")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders a dash when APY is exactly zero (current behavior)", () => {
    render(<MetricCards exchangeRate={0} apy={0} />);

    expect(screen.getByText("0.0000 VSN")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
