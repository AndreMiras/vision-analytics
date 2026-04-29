import {
  cn,
  formatUSDValue,
  fromWeiToToken,
  toHumanReadable,
} from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("utils", () => {
  describe("fromWeiToToken", () => {
    it("converts whole-token wei values", () => {
      expect(fromWeiToToken("1000000000000000000")).toBe(1);
      expect(fromWeiToToken("25000000000000000000")).toBe(25);
    });

    it("converts decimal-token wei values", () => {
      expect(fromWeiToToken("1500000000000000000")).toBe(1.5);
      expect(fromWeiToToken("123456789000000000")).toBe(0.123456789);
    });

    it("converts zero wei values", () => {
      expect(fromWeiToToken("0")).toBe(0);
    });
  });

  describe("toHumanReadable", () => {
    it("formats representative values with compact notation", () => {
      expect(toHumanReadable(999)).toBe("999");
      expect(toHumanReadable(1_234)).toBe("1.2K");
      expect(toHumanReadable(1_000_000)).toBe("1M");
    });
  });

  describe("formatUSDValue", () => {
    it("formats USD values without compact notation by default", () => {
      expect(formatUSDValue(1_234)).toBe("$1,234");
      expect(formatUSDValue(1_234.56)).toBe("$1,235");
    });

    it("formats USD values with compact notation when requested", () => {
      expect(formatUSDValue(1_234_567, true)).toBe("$1M");
    });
  });

  describe("cn", () => {
    it("merges conditional classes and resolves tailwind conflicts", () => {
      expect(cn("px-2", "text-sm", false && "hidden", "px-4")).toBe(
        "text-sm px-4",
      );
    });
  });
});
