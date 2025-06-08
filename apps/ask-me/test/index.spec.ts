import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /", () => {
  // NOTE: The SSR plugin is not compatible with the test environment for now.
  it.skip("response working in progress", async () => {
    const response = await SELF.fetch("http://example.com/");
    expect(await response.status).toBe(200);
    expect(await response.text()).toContain("Working in progress...");
  });
});
