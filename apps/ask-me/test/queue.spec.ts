import { describe, expect, it } from "vitest";
import { buildQueueAction, whenObjectQueue } from "./steps/queue";

describe("Queue Tests", () => {
  describe("PutObject", () => {
    it("is expected to acknowledge the message", async () => {
      const result = await whenObjectQueue(
        buildQueueAction("PutObject", "testKey", { content: "test content" }),
      );

      expect(result).toBeTruthy();
    });
  });

  describe("DeleteObject", () => {
    it("is expected to acknowledge the message", async () => {
      const result = await whenObjectQueue(
        buildQueueAction("DeleteObject", "testKey"),
      );

      expect(result).toBeTruthy();
    });
  });

  describe("Multiple Actions", () => {
    it("should process multiple queue actions", async () => {
      const results = await whenObjectQueue([
        buildQueueAction("PutObject", "firstKey", { content: "first content" }),
        buildQueueAction("DeleteObject", "secondKey"),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeTruthy();
      expect(results[1]).toBeTruthy();
    });
  });
});
