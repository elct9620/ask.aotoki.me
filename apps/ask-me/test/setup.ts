import "@abraham/reflection";

import { VECTORIZE } from "@/repository/cloudflareVectorRepository";
import { IVectorRepository } from "@/usecase/interface";
import { container } from "tsyringe";
import { beforeEach } from "vitest";
import { MockVectorRepository } from "./mocks/mockVectorRepository";

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

  // Register mock vector repository
  container.register(IVectorRepository, {
    useClass: MockVectorRepository,
  });
});
