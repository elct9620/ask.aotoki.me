import { DocumentVector } from "@/entity/DocumentVector";
import { VectorRepository } from "@/usecase/interface";
import { injectable } from "tsyringe";

/**
 * Mock implementation of VectorRepository for testing
 */
@injectable()
export class MockVectorRepository implements VectorRepository {
  deletedIds: string[] = [];
  upsertedVectors: DocumentVector[] = [];
  queryResults: DocumentVector[] = [];

  /**
   * Mock implementation of upsertAll that records the vectors
   * rather than actually upserting them
   */
  async upsertAll(vectors: DocumentVector[]): Promise<void> {
    this.upsertedVectors.push(...vectors);
    return Promise.resolve();
  }

  /**
   * Mock implementation of deleteAll that records the ids
   * rather than actually deleting them
   */
  async deleteAll(ids: string[]): Promise<void> {
    this.deletedIds.push(...ids);
    return Promise.resolve();
  }

  /**
   * Mock implementation of query that returns predefined results
   */
  async query(query: string, topK: number = 5): Promise<DocumentVector[]> {
    return this.queryResults.slice(0, topK);
  }

  /**
   * Reset the mock state
   */
  reset(): void {
    this.deletedIds = [];
    this.upsertedVectors = [];
    this.queryResults = [];
  }
}
