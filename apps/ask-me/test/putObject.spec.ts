import { describe, expect, it } from "vitest";
import { buildQueueAction, whenObjectQueue } from "./steps/queue";
import { givenObjectWithContent } from "./steps/r2";

describe("PutObject", () => {
  const objectKey = "content/example.json";

  it("is expected to add content to R2", async () => {
    await givenObjectWithContent(objectKey, {
      id: "47e39fd5c33ab248111f009c9fe4c4ff",
      path: "posts/2021-12-19-containerize-ruby-on-rails-in-a-few-minutes.md",
      slug: "containerize-ruby-on-rails-in-a-few-minutes",
      title: "How to containerize your Rails in minutes",
      tags: ["Rails", "Container", "Docker", "Cloud", "CNCF", "DevOps"],
      series: null,
      published_at: "2021-12-19T00:00:00+08:00",
      permalink:
        "https://blog.aotoki.me/en/posts/2021/12/19/containerize-ruby-on-rails-in-a-few-minutes/",
      language: "en",
      content: "...",
    });
  });

  it("is expected to ack queue", async () => {
    const result = await whenObjectQueue(
      buildQueueAction("PutObject", objectKey, { id: "test-id" }),
    );

    expect(result.outcome).toBe("ok");
    expect(result.explicitAcks).toContain("test-id");
  });
});
