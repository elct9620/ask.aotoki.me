import "@abraham/reflection";

import { VECTORIZE } from "@/repository/cloudflareVectorRepository";
import { BUCKET } from "@/repository/r2ArticleRepository";
import { env } from "cloudflare:test";
import { container } from "tsyringe";
import { beforeEach } from "vitest";

// Register mock repositories before tests run
beforeEach(() => {
  // Clear container before each test to ensure a clean state
  container.clearInstances();

  // Register mock Vectorize binding
  container.register(VECTORIZE, {
    useValue: {
      deleteByIds: async () => Promise.resolve(),
      upsert: async () => Promise.resolve(),
    },
  });

  container.register(BUCKET, {
    useValue: env.BUCKET,
  });
});
