/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { Header } from "./Header";

const navHrefs = [
  "/",
  "/tvl",
  "/staking-overview",
  "/rewards-cycles",
  "/unstaking",
];

describe("Header", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the brand link to the home page", () => {
    render(<Header />);

    const brandLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/");

    expect(brandLinks.length).toBeGreaterThan(0);
    expect(screen.getByText("Bitpanda Vision Analytics")).toBeInTheDocument();
    expect(screen.getByText("Vision Analytics")).toBeInTheDocument();
  });

  it("renders the five desktop nav links with expected hrefs", () => {
    render(<Header />);

    const links = screen.getAllByRole("link");
    const allHrefs = links.map((link) => link.getAttribute("href"));

    for (const href of navHrefs) {
      expect(allHrefs).toContain(href);
    }
  });

  it("renders the GitHub link with target=_blank", () => {
    render(<Header />);

    const github = screen
      .getAllByRole("link")
      .find((link) =>
        link
          .getAttribute("href")
          ?.includes("github.com/AndreMiras/vision-analytics"),
      );

    expect(github).toBeDefined();
    expect(github).toHaveAttribute("target", "_blank");
    expect(within(github!).getByText("About")).toBeInTheDocument();
  });

  it("toggles the mobile menu when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    const initialHrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    const desktopNavCount = navHrefs.filter((href) =>
      initialHrefs.includes(href),
    ).length;

    expect(container.querySelector("nav.lg\\:hidden")).toBeNull();

    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    await user.click(toggle);

    const afterOpenLinks = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    for (const href of navHrefs) {
      const occurrences = afterOpenLinks.filter((h) => h === href).length;
      expect(occurrences).toBeGreaterThan(
        initialHrefs.filter((h) => h === href).length === desktopNavCount
          ? 0
          : 0,
      );
    }
    expect(afterOpenLinks.length).toBe(initialHrefs.length + navHrefs.length);

    await user.click(toggle);
    const afterCloseLinks = screen.getAllByRole("link");
    expect(afterCloseLinks.length).toBe(initialHrefs.length);
  });

  it("closes the mobile menu when a nav link is clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const initialLinkCount = screen.getAllByRole("link").length;
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    await user.click(toggle);

    expect(screen.getAllByRole("link").length).toBe(
      initialLinkCount + navHrefs.length,
    );

    const mobileLinks = screen
      .getAllByRole("link")
      .filter((link) => link.className.includes("hover:bg-blue-100"));
    expect(mobileLinks.length).toBe(navHrefs.length);

    await user.click(mobileLinks[0]);

    expect(screen.getAllByRole("link").length).toBe(initialLinkCount);
  });
});
