import { EmbeddingModel } from "ai";
import { injectable } from "tsyringe";

/**
 * Mock implementation of EmbeddingModelV1 for testing
 */
@injectable()
export class MockEmbeddingModel<T> implements EmbeddingModel<T> {
  readonly specificationVersion = "v1" as const;
  readonly provider = "mock";
  readonly modelId = "mock-embedding-model";
  readonly maxEmbeddingsPerCall = 10;
  readonly supportsParallelCalls = true;

  /**
   * Mock embeddings to return for specific inputs
   */
  private mockEmbeddingMap = new Map<string, number[]>();

  /**
   * Set a specific mock embedding for a given input
   */
  setMockEmbedding(input: string, embedding: number[]): void {
    this.mockEmbeddingMap.set(input, embedding);
  }

  /**
   * Generate a default mock embedding of the specified dimension
   */
  private generateDefaultEmbedding(dimension: number = 1536): number[] {
    return Array.from({ length: dimension }, () => Math.random());
  }

  /**
   * Implementation of doEmbed method that returns mock embeddings
   */
  async doEmbed(options: {
    values: Array<T>;
    abortSignal?: AbortSignal;
    headers?: Record<string, string | undefined>;
  }): Promise<{
    embeddings: Array<number[]>;
    usage?: { tokens: number };
    rawResponse?: {
      headers?: Record<string, string>;
    };
  }> {
    // Create mock embeddings for each input
    const embeddings = options.values.map((value) => {
      const key = String(value);
      // Use stored embedding if available, otherwise generate a new one
      return this.mockEmbeddingMap.get(key) || this.generateDefaultEmbedding();
    });

    return {
      embeddings,
      usage: {
        tokens: options.values.reduce(
          (sum, value) => sum + String(value).length,
          0,
        ),
      },
      rawResponse: {
        headers: { "x-mock": "true" },
      },
    };
  }
}
