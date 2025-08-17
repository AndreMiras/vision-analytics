import assert from "node:assert";
import { formatRelativeTime, toSeconds, toMilliseconds } from "@/utils/time";

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
});
