import {
  formatRelativeTime,
  formatTimeRemaining,
  toMilliseconds,
  toSeconds,
} from "@/utils/time";
import { describe, expect, it } from "vitest";

describe("time", () => {
  describe("toSeconds", () => {
    it("should convert minutes to seconds", () => {
      expect(toSeconds.fromMinutes(1)).toBe(60);
      expect(toSeconds.fromMinutes(2)).toBe(120);
      expect(toSeconds.fromMinutes(0.5)).toBe(30);
    });

    it("should convert hours to seconds", () => {
      expect(toSeconds.fromHours(1)).toBe(3600);
      expect(toSeconds.fromHours(2)).toBe(7200);
      expect(toSeconds.fromHours(0.5)).toBe(1800);
    });

    it("should convert days to seconds", () => {
      expect(toSeconds.fromDays(1)).toBe(86400);
      expect(toSeconds.fromDays(2)).toBe(172800);
    });
  });

  describe("toMilliseconds", () => {
    it("should convert seconds to milliseconds", () => {
      expect(toMilliseconds.fromSeconds(1)).toBe(1000);
      expect(toMilliseconds.fromSeconds(5)).toBe(5000);
      expect(toMilliseconds.fromSeconds(0.1)).toBe(100);
    });

    it("should convert minutes to milliseconds", () => {
      expect(toMilliseconds.fromMinutes(1)).toBe(60000);
      expect(toMilliseconds.fromMinutes(2)).toBe(120000);
    });

    it("should convert hours to milliseconds", () => {
      expect(toMilliseconds.fromHours(1)).toBe(3600000);
      expect(toMilliseconds.fromHours(2)).toBe(7200000);
    });

    it("should convert days to milliseconds", () => {
      expect(toMilliseconds.fromDays(1)).toBe(86400000);
    });
  });

  describe("formatRelativeTime", () => {
    const ref = new Date("2025-08-18T12:00:00Z");
    const dayMs = 1000 * 60 * 60 * 24;

    it("Today: same moment", () => {
      expect(formatRelativeTime(new Date(ref), ref)).toBe("Today");
    });

    it("Today: earlier on same day (small negative -> ceil to 0)", () => {
      const ts = new Date("2025-08-18T11:00:00Z");
      expect(formatRelativeTime(ts, ref)).toBe("Today");
    });

    it("Tomorrow: +1 second", () => {
      const ts = new Date("2025-08-18T12:00:01Z");
      expect(formatRelativeTime(ts, ref)).toBe("Tomorrow");
    });

    it("Past due: at least one full day behind", () => {
      const ts = new Date("2025-08-17T11:59:00Z"); // < -1 day
      expect(formatRelativeTime(ts, ref)).toBe("Past due");
    });

    for (let d = 2; d <= 6; d++) {
      it(`${d} days: exactly +${d} days`, () => {
        const later = new Date(ref.getTime() + d * dayMs);
        expect(formatRelativeTime(later, ref)).toBe(`${d} days`);
      });
    }

    it("7+ days: returns localized date string (exactly +7 days)", () => {
      const later = new Date(ref.getTime() + 7 * dayMs);
      const expected = "Aug 25, 2025";
      expect(formatRelativeTime(later, ref)).toBe(expected);
    });
  });

  describe("formatTimeRemaining", () => {
    const ref = new Date("2025-09-06T12:00:00Z");
    const refTimestamp = Math.floor(ref.getTime() / 1000);

    it("should return 'Past due' for timestamps in the past", () => {
      const pastTimestamp = refTimestamp - 3600; // 1 hour ago
      expect(formatTimeRemaining(pastTimestamp, ref)).toBe("Past due");
    });

    it("should format days and hours when difference is >= 1 day", () => {
      // Exactly 1 day and 2 hours from reference
      const futureTimestamp =
        refTimestamp + toSeconds.fromDays(1) + toSeconds.fromHours(2);
      expect(formatTimeRemaining(futureTimestamp, ref)).toBe("1d 2h");

      // 3 days and 5 hours
      const futureTimestamp2 =
        refTimestamp + toSeconds.fromDays(3) + toSeconds.fromHours(5);
      expect(formatTimeRemaining(futureTimestamp2, ref)).toBe("3d 5h");

      // Exactly 2 days (0 hours)
      const exactDaysTimestamp = refTimestamp + toSeconds.fromDays(2);
      expect(formatTimeRemaining(exactDaysTimestamp, ref)).toBe("2d 0h");
    });

    it("should format only hours when difference is < 1 day and >= 1 hour", () => {
      // 5 hours from reference
      const futureTimestamp = refTimestamp + toSeconds.fromHours(5);
      expect(formatTimeRemaining(futureTimestamp, ref)).toBe("5h");

      // 23 hours (less than a day)
      const almostDayTimestamp = refTimestamp + toSeconds.fromHours(23);
      expect(formatTimeRemaining(almostDayTimestamp, ref)).toBe("23h");

      // Exactly 1 hour
      const oneHourTimestamp = refTimestamp + toSeconds.fromHours(1);
      expect(formatTimeRemaining(oneHourTimestamp, ref)).toBe("1h");
    });

    it("should format only minutes when difference is < 1 hour", () => {
      // 30 minutes from reference
      const futureTimestamp = refTimestamp + toSeconds.fromMinutes(30);
      expect(formatTimeRemaining(futureTimestamp, ref)).toBe("30m");

      // 5 minutes
      const fiveMinutesTimestamp = refTimestamp + toSeconds.fromMinutes(5);
      expect(formatTimeRemaining(fiveMinutesTimestamp, ref)).toBe("5m");

      // 0 minutes (same time, rounded down)
      const sameTimeTimestamp = refTimestamp + 30; // 30 seconds
      expect(formatTimeRemaining(sameTimeTimestamp, ref)).toBe("0m");
    });

    it("should use current time as default reference", () => {
      // Test that it works without passing a reference time
      // We can't test exact values since it uses current time, but we can test it doesn't throw
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const result = formatTimeRemaining(futureTimestamp);
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Past due");
    });

    it("should handle edge cases correctly", () => {
      // Exactly at the target time
      expect(formatTimeRemaining(refTimestamp, ref)).toBe("0m");

      // Very small positive difference (< 1 minute)
      const almostSameTimestamp = refTimestamp + 30; // 30 seconds later
      expect(formatTimeRemaining(almostSameTimestamp, ref)).toBe("0m");

      // Very small negative difference
      const slightlyPastTimestamp = refTimestamp - 1; // 1 second ago
      expect(formatTimeRemaining(slightlyPastTimestamp, ref)).toBe("Past due");
    });
  });
});
