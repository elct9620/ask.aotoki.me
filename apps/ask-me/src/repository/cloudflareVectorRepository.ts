import { VectorRepository } from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

export const VECTORIZE = Symbol("VECTORIZE");

/**
 * Repository implementation for Cloudflare Vectorize
 */
@injectable()
export class CloudflareVectorRepository implements VectorRepository {
  constructor(@inject(VECTORIZE) private readonly vectorize: Vectorize) {}

  /**
   * Delete multiple vectors by their IDs
   *
   * @param ids Array of vector IDs to delete
   * @returns Promise that resolves when all vectors are deleted
   */
  async deleteAll(ids: string[]): Promise<void> {
    // Skip if there are no IDs to delete
    if (ids.length === 0) return;

    try {
      // Delete all vectors in a single operation
      await this.vectorize.deleteByIds(ids);
    } catch (error) {
      throw new Error(`Failed to delete vectors: ${error}`);
    }
  }
}
