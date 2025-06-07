import { SELF } from "cloudflare:test";
import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";

describe("DeleteObject", () => {
  it("is expected to ack queue", async () => {
    const result = await SELF.queue("ask-me", [
      {
        id: randomBytes(16).toString("hex"),
        timestamp: new Date(1000),
        attempts: 1,
        body: {
          action: "DeleteObject",
          object: {
            key: "content/example.json",
          },
        },
      },
    ]);

    expect(result.outcome).toBe("ok");
  });
});
