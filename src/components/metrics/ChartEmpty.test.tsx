/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChartEmpty } from "./ChartEmpty";

describe("ChartEmpty", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the children inside the empty-state wrapper", () => {
    const { container } = render(
      <ChartEmpty>
        <span>No data</span>
      </ChartEmpty>,
    );

    expect(screen.getByText("No data")).toBeInTheDocument();
    expect((container.firstChild as HTMLElement).className).toContain(
      "h-[400px]",
    );
  });
});
