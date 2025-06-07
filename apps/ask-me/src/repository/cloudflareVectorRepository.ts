import { DocumentVector } from "@/entity/DocumentVector";
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
   * Insert or update multiple vectors in the vector database
   *
   * @param vectors Array of document vectors to upsert
   * @returns Promise that resolves when all vectors are upserted
   */
  async upsertAll(vectors: DocumentVector[]): Promise<void> {
    // Skip if there are no vectors to upsert
    if (vectors.length === 0) return;

    try {
      // Prepare vectors for upsert
      const upserts = vectors.map(vector => ({
        id: vector.id,
        values: vector.vector,
        metadata: {
          key: vector.key,
          type: vector.type
        }
      }));

      // Upsert all vectors in a single operation
      await this.vectorize.upsert(upserts);
    } catch (error) {
      throw new Error(`Failed to upsert vectors: ${error}`);
    }
  }

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
