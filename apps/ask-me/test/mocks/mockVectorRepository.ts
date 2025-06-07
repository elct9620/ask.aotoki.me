import { VectorRepository } from "@/usecase/interface";
import { injectable } from "tsyringe";

/**
 * Mock implementation of VectorRepository for testing
 */
@injectable()
export class MockVectorRepository implements VectorRepository {
  deletedIds: string[] = [];

  /**
   * Mock implementation of deleteAll that records the ids
   * rather than actually deleting them
   */
  async deleteAll(ids: string[]): Promise<void> {
    this.deletedIds.push(...ids);
    return Promise.resolve();
  }

  /**
   * Reset the mock state
   */
  reset(): void {
    this.deletedIds = [];
  }
}
