import "@abraham/reflection";

import { VECTORIZE } from "@/repository/cloudflareVectorRepository";
import { BUCKET } from "@/repository/r2ArticleRepository";
import { IEmbeddingModel, ISummaryModel } from "@/service/llm";
import { env } from "cloudflare:test";
import { container, instanceCachingFactory } from "tsyringe";
import { beforeEach } from "vitest";
import { MockEmbeddingModel } from "./mocks/mockEmbeddingModel";
import { MockLanguageModel } from "./mocks/mockLanguageModel";

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

  container.register(IEmbeddingModel, {
    useFactory: instanceCachingFactory((c) => {
      return new MockEmbeddingModel<string>();
    }),
  });

  container.register(ISummaryModel, {
    useFactory: instanceCachingFactory((c) => {
      return new MockLanguageModel();
    }),
  });
});
