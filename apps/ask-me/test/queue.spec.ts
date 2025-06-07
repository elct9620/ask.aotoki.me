import { describe, expect, it } from "vitest";
import { buildQueueAction, whenObjectQueue } from "./steps/queue";

describe("Queue Tests", () => {
  describe("PutObject", () => {
    it("is expected to acknowledge the message", async () => {
      const result = await whenObjectQueue(
        buildQueueAction("PutObject", "testKey", { content: "test content" }),
      );

      expect(result.success).toBeTruthy();
      expect(result.message.body.key).toBe("testKey");
      expect(result.message.body.content).toBe("test content");
    });
  });

  describe("DeleteObject", () => {
    it("is expected to acknowledge the message", async () => {
      const result = await whenObjectQueue(
        buildQueueAction("DeleteObject", "testKey"),
      );

      expect(result.success).toBeTruthy();
      expect(result.message.body.key).toBe("testKey");
    });
  });

  describe("Multiple Actions", () => {
    it("should process multiple queue actions", async () => {
      const results = await whenObjectQueue([
        buildQueueAction("PutObject", "firstKey", { content: "first content" }),
        buildQueueAction("DeleteObject", "secondKey"),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBeTruthy();
      expect(results[1].success).toBeTruthy();
      expect(results[0].message.body.key).toBe("firstKey");
      expect(results[1].message.body.key).toBe("secondKey");
    });
  });
});
