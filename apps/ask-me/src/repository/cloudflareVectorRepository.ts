import { Vector, VectorType } from "@/entity/Vector";
import { IEmbeddingModel } from "@/service/llm";
import { VectorRepository } from "@/usecase/interface";
import { embed, type EmbeddingModel } from "ai";
import { inject, injectable } from "tsyringe";

export const VECTORIZE = Symbol("VECTORIZE");

/**
 * Repository implementation for Cloudflare Vectorize
 */
@injectable()
export class CloudflareVectorRepository implements VectorRepository {
  constructor(
    @inject(VECTORIZE) private readonly vectorize: Vectorize,
    @inject(IEmbeddingModel)
    private readonly embeddingModel: EmbeddingModel<string>,
  ) {}

  /**
   * Query the vector database for similar vectors to the given query
   *
   * @param query Text query to search for
   * @param topK Maximum number of results to return (default: 5)
   * @returns Promise resolving to array of document vectors matching the query, deduplicated by objectKey
   */
  async query(query: string, topK: number = 5): Promise<Vector[]> {
    try {
      // Convert query to embedding
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: query,
      });

      // Query the vector database
      const results = await this.vectorize.query(embedding, {
        topK: topK * 2,
        returnValues: true,
        returnMetadata: "all",
      });

      // Convert results to Vector objects
      const vectors = results.matches.map((match) => {
        const [id, type] = match.id.split("#");

        const vector = new Vector(id, type as VectorType);

        // Add vector values if available
        if (match.values) {
          vector.update(match.values as number[]);
        }

        // Add metadata if available
        if (match.metadata) {
          for (const [key, value] of Object.entries(match.metadata)) {
            vector.setMetadata(key, value);
          }
        }

        return vector;
      });

      // Deduplicate vectors by objectKey, keeping only the first occurrence of each objectKey
      const uniqueVectors: Vector[] = [];
      const seenObjectKeys = new Set<string>();
      
      for (const vector of vectors) {
        const objectKey = vector.objectKey;
        if (objectKey !== null && !seenObjectKeys.has(objectKey)) {
          seenObjectKeys.add(objectKey);
          uniqueVectors.push(vector);
          
          // Limit to topK unique vectors
          if (uniqueVectors.length >= topK) {
            break;
          }
        }
      }
      
      return uniqueVectors;
    } catch (error) {
      throw new Error(`Failed to query vectors: ${error}`);
    }
  }

  /**
   * Insert or update multiple vectors in the vector database
   *
   * @param vectors Array of document vectors to upsert
   * @returns Promise that resolves when all vectors are upserted
   */
  async upsertAll(vectors: Vector[]): Promise<void> {
    // Skip if there are no vectors to upsert
    if (vectors.length === 0) return;

    try {
      // Prepare vectors for upsert
      const upserts = vectors.map((vector) => ({
        id: vector.id,
        values: vector.vector,
        metadata: vector.metadata,
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
