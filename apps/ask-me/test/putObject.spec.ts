import { describe, expect, it } from "vitest";
import { buildQueueAction, whenObjectQueue } from "./steps/queue";

describe("PutObject", () => {
  it("is expected to ack queue", async () => {
    const result = await whenObjectQueue(
      buildQueueAction("PutObject", "content/example.json", { id: "test-id" }),
    );

    expect(result.outcome).toBe("ok");
    expect(result.explicitAcks).toContain("test-id");
  });
});
