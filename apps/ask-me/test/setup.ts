import { container } from "tsyringe";
import { beforeEach } from "vitest";
import { IVectorRepository } from "@/usecase/interface";
import { MockVectorRepository } from "./mocks/mockVectorRepository";
import { VECTORIZE } from "@/repository/cloudflareVectorRepository";

// Register mock repositories before tests run
beforeEach(() => {
  // Clear container before each test to ensure a clean state
  container.clearInstances();
  
  // Register mock Vectorize binding
  container.register(VECTORIZE, {
    useValue: {
      deleteByIds: async () => Promise.resolve(),
    }
  });
  
  // Register mock vector repository
  container.register(IVectorRepository, {
    useClass: MockVectorRepository
  });
});
