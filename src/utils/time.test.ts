import assert from "node:assert";
import { toSeconds, toMilliseconds } from "@/utils/time";

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
});
