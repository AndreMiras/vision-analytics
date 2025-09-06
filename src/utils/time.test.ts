import assert from "node:assert";
import {
  formatRelativeTime,
  formatTimeRemaining,
  toMilliseconds,
  toSeconds,
} from "@/utils/time";

describe("time", () => {
  describe("toSeconds", () => {
    it("should convert minutes to seconds", () => {
      assert.strictEqual(toSeconds.fromMinutes(1), 60);
      assert.strictEqual(toSeconds.fromMinutes(2), 120);
      assert.strictEqual(toSeconds.fromMinutes(0.5), 30);
    });

    it("should convert hours to seconds", () => {
      assert.strictEqual(toSeconds.fromHours(1), 3600);
      assert.strictEqual(toSeconds.fromHours(2), 7200);
      assert.strictEqual(toSeconds.fromHours(0.5), 1800);
    });

    it("should convert days to seconds", () => {
      assert.strictEqual(toSeconds.fromDays(1), 86400);
      assert.strictEqual(toSeconds.fromDays(2), 172800);
    });
  });

  describe("toMilliseconds", () => {
    it("should convert seconds to milliseconds", () => {
      assert.strictEqual(toMilliseconds.fromSeconds(1), 1000);
      assert.strictEqual(toMilliseconds.fromSeconds(5), 5000);
      assert.strictEqual(toMilliseconds.fromSeconds(0.1), 100);
    });

    it("should convert minutes to milliseconds", () => {
      assert.strictEqual(toMilliseconds.fromMinutes(1), 60000);
      assert.strictEqual(toMilliseconds.fromMinutes(2), 120000);
    });

    it("should convert hours to milliseconds", () => {
      assert.strictEqual(toMilliseconds.fromHours(1), 3600000);
      assert.strictEqual(toMilliseconds.fromHours(2), 7200000);
    });

    it("should convert days to milliseconds", () => {
      assert.strictEqual(toMilliseconds.fromDays(1), 86400000);
    });
  });

  describe("formatRelativeTime", () => {
    const ref = new Date("2025-08-18T12:00:00Z");
    const dayMs = 1000 * 60 * 60 * 24;

    it("Today: same moment", () => {
      assert.equal(formatRelativeTime(new Date(ref), ref), "Today");
    });

    it("Today: earlier on same day (small negative -> ceil to 0)", () => {
      const ts = new Date("2025-08-18T11:00:00Z");
      assert.equal(formatRelativeTime(ts, ref), "Today");
    });

    it("Tomorrow: +1 second", () => {
      const ts = new Date("2025-08-18T12:00:01Z");
      assert.equal(formatRelativeTime(ts, ref), "Tomorrow");
    });

    it("Past due: at least one full day behind", () => {
      const ts = new Date("2025-08-17T11:59:00Z"); // < -1 day
      assert.equal(formatRelativeTime(ts, ref), "Past due");
    });

    for (let d = 2; d <= 6; d++) {
      it(`${d} days: exactly +${d} days`, () => {
        const later = new Date(ref.getTime() + d * dayMs);
        assert.equal(formatRelativeTime(later, ref), `${d} days`);
      });
    }

    it("7+ days: returns localized date string (exactly +7 days)", () => {
      const later = new Date(ref.getTime() + 7 * dayMs);
      const expected = "Aug 25, 2025";
      assert.equal(formatRelativeTime(later, ref), expected);
    });
  });

  describe("formatTimeRemaining", () => {
    const ref = new Date("2025-09-06T12:00:00Z");
    const refTimestamp = Math.floor(ref.getTime() / 1000);

    it("should return 'Past due' for timestamps in the past", () => {
      const pastTimestamp = refTimestamp - 3600; // 1 hour ago
      assert.strictEqual(formatTimeRemaining(pastTimestamp, ref), "Past due");
    });

    it("should format days and hours when difference is >= 1 day", () => {
      // Exactly 1 day and 2 hours from reference
      const futureTimestamp =
        refTimestamp + toSeconds.fromDays(1) + toSeconds.fromHours(2);
      assert.strictEqual(formatTimeRemaining(futureTimestamp, ref), "1d 2h");

      // 3 days and 5 hours
      const futureTimestamp2 =
        refTimestamp + toSeconds.fromDays(3) + toSeconds.fromHours(5);
      assert.strictEqual(formatTimeRemaining(futureTimestamp2, ref), "3d 5h");

      // Exactly 2 days (0 hours)
      const exactDaysTimestamp = refTimestamp + toSeconds.fromDays(2);
      assert.strictEqual(formatTimeRemaining(exactDaysTimestamp, ref), "2d 0h");
    });

    it("should format only hours when difference is < 1 day and >= 1 hour", () => {
      // 5 hours from reference
      const futureTimestamp = refTimestamp + toSeconds.fromHours(5);
      assert.strictEqual(formatTimeRemaining(futureTimestamp, ref), "5h");

      // 23 hours (less than a day)
      const almostDayTimestamp = refTimestamp + toSeconds.fromHours(23);
      assert.strictEqual(formatTimeRemaining(almostDayTimestamp, ref), "23h");

      // Exactly 1 hour
      const oneHourTimestamp = refTimestamp + toSeconds.fromHours(1);
      assert.strictEqual(formatTimeRemaining(oneHourTimestamp, ref), "1h");
    });

    it("should format only minutes when difference is < 1 hour", () => {
      // 30 minutes from reference
      const futureTimestamp = refTimestamp + toSeconds.fromMinutes(30);
      assert.strictEqual(formatTimeRemaining(futureTimestamp, ref), "30m");

      // 5 minutes
      const fiveMinutesTimestamp = refTimestamp + toSeconds.fromMinutes(5);
      assert.strictEqual(formatTimeRemaining(fiveMinutesTimestamp, ref), "5m");

      // 0 minutes (same time, rounded down)
      const sameTimeTimestamp = refTimestamp + 30; // 30 seconds
      assert.strictEqual(formatTimeRemaining(sameTimeTimestamp, ref), "0m");
    });

    it("should use current time as default reference", () => {
      // Test that it works without passing a reference time
      // We can't test exact values since it uses current time, but we can test it doesn't throw
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const result = formatTimeRemaining(futureTimestamp);
      assert.strictEqual(typeof result, "string");
      assert.notStrictEqual(result, "Past due");
    });

    it("should handle edge cases correctly", () => {
      // Exactly at the target time
      assert.strictEqual(formatTimeRemaining(refTimestamp, ref), "0m");

      // Very small positive difference (< 1 minute)
      const almostSameTimestamp = refTimestamp + 30; // 30 seconds later
      assert.strictEqual(formatTimeRemaining(almostSameTimestamp, ref), "0m");

      // Very small negative difference
      const slightlyPastTimestamp = refTimestamp - 1; // 1 second ago
      assert.strictEqual(
        formatTimeRemaining(slightlyPastTimestamp, ref),
        "Past due",
      );
    });
  });
});
