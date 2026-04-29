/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";
import { UnstakingList } from "./UnstakingList";

const makeItem = (
  cooldownEnd: number,
  shares: number,
  transactionHash: string,
): ConvertedUnstakingSnapshot => ({
  blockTimestamp: 1_799_913_600,
  cooldownEnd,
  shares,
  transactionHash,
});

describe("UnstakingList", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the loading skeleton state", () => {
    const { container } = render(
      <UnstakingList data={[]} currentPrice={2} loading />,
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
    expect(
      screen.queryByText("No pending unlocks found"),
    ).not.toBeInTheDocument();
  });

  it("renders the empty state", () => {
    render(<UnstakingList data={[]} currentPrice={2} />);

    expect(screen.getByText("No pending unlocks found")).toBeInTheDocument();
  });

  it("sorts cooldown rows and renders values, dates, and transaction links", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-15T08:00:00.000Z"));
    const earliestHash =
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const laterHash =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";
    const data = [
      makeItem(1_800_259_200, 2000, laterHash),
      makeItem(1_800_086_400, 1234.5, earliestHash),
    ];

    render(<UnstakingList data={data} currentPrice={2} />);

    const rows = screen.getAllByText(/sVSN/).map((amount) => {
      const row = amount.closest(".flex.justify-between");
      expect(row).not.toBeNull();
      return row as HTMLElement;
    });

    expect(rows[0]).toHaveTextContent("1,234.50 sVSN ($2,469)");
    expect(rows[0]).toHaveTextContent("Jan 16, 2027, 08:00 AM");
    expect(rows[0]).toHaveTextContent("Started: Jan 14, 2027, 08:00 AM");
    expect(within(rows[0]).getByText("1d 0h")).toBeInTheDocument();
    expect(
      within(rows[0]).getByRole("link", { name: /0xabcd\.\.\.7890/i }),
    ).toHaveAttribute("href", `https://etherscan.io/tx/${earliestHash}`);

    expect(rows[1]).toHaveTextContent("2,000.00 sVSN ($4,000)");
    expect(
      within(rows[1]).getByText("Jan 18, 2027, 08:00 AM"),
    ).toBeInTheDocument();
  });

  it("renders the first ten note when more than ten items are provided", () => {
    const data = Array.from({ length: 11 }, (_, index) =>
      makeItem(
        1_800_086_400 + index * 86_400,
        100 + index,
        `0x${index.toString().padStart(64, "0")}`,
      ),
    );

    render(<UnstakingList data={data} currentPrice={2} />);

    expect(
      screen.getByText("Showing first 10 upcoming unlocks"),
    ).toBeInTheDocument();
  });
});
