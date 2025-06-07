import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /", () => {
  it("response working in progress", async () => {
    const response = await SELF.fetch("http://example.com/");
    expect(await response.status).toBe(200);
    expect(await response.text()).toBe("Working in progress...");
  });
});
