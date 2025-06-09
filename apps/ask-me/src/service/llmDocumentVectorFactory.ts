import { Article } from "@/entity/Article";
import { SubTopicInstruction, SummaryInstruction } from "@/entity/Instruction";
import {
  MaxTopicVectorCount,
  TopicVector,
  Vector,
  VectorType,
} from "@/entity/Vector";
import {
  DocumentVectorFactory,
  IVectorIdEncoder,
  type VectorIdEncoder,
} from "@/usecase/interface";
import {
  APICallError,
  embed,
  generateObject,
  generateText,
  type EmbeddingModel,
  type LanguageModel,
} from "ai";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { IEmbeddingModel, ISummaryModel } from "./llm";

/**
 * Implementation of VectorFactory that will use LLMs to generate vectors
 * Currently returns mock objects for future implementation
 */
@injectable()
export class LlmDocumentVectorFactory implements DocumentVectorFactory {
  constructor(
    @inject(IVectorIdEncoder)
    private readonly vectorIdEncoder: VectorIdEncoder,
    @inject(IEmbeddingModel)
    private readonly embeddingModel: EmbeddingModel<string>,
    @inject(ISummaryModel)
    private readonly summaryModel: LanguageModel,
  ) {}
  /**
   * Add metadata from an article to a document vector
   *
   * @param vector The vector to update with metadata
   * @param article The source article for metadata
   */
  private setVectorMetadata(vector: Vector, article: Article): void {
    vector.setMetadata("title", article.title);
    vector.setMetadata("objectKey", article.objectKey);

    if (article.series) {
      vector.setMetadata("series", article.series);
    }

    if (article.publishedAt) {
      vector.setMetadata("publishedAt", article.publishedAt);
    }

    if (article.permalink) {
      vector.setMetadata("permalink", article.permalink);
    }
  }

  /**
   * Create a full document vector containing detailed content
   *
   * @param article Article object containing the content
   * @returns A Vector with full content
   */
  async createFull(article: Article): Promise<Vector | null> {
    const encodedKey = this.vectorIdEncoder.encode(article.id);
    // This is a placeholder implementation
    // In the future, this would call an LLM to generate vectors
    const vector = new Vector(encodedKey, VectorType.FULL);

    // Set metadata from article
    this.setVectorMetadata(vector, article);

    try {
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: article.content,
      });

      vector.update(embedding);
    } catch (error) {
      if (APICallError.isInstance(error)) {
        return null; // Handle API call errors gracefully
      }

      throw error; // Rethrow other unexpected errors
    }

    return vector;
  }

  /**
   * Create a summary document vector containing condensed content
   *
   * @param article Article object containing the content
   * @returns A Vector with summary content
   */
  async createSummary(article: Article): Promise<Vector> {
    const encodedKey = this.vectorIdEncoder.encode(article.id);
    // This is a placeholder implementation
    // In the future, this would call an LLM to generate vectors
    const vector = new Vector(encodedKey, VectorType.SUMMARY);

    // Set metadata from article
    this.setVectorMetadata(vector, article);

    const { text: summary } = await generateText({
      model: this.summaryModel,
      system: SummaryInstruction,
      prompt: article.content,
    });

    const { embedding } = await embed({
      model: this.embeddingModel,
      value: summary,
    });

    vector.update(embedding);

    return vector;
  }

  /**
   * Create sub-topic vectors for an article
   *
   * @param article Article object to segment
   * @returns Array of sub-topic vectors
   */
  async createTopics(article: Article): Promise<Vector[]> {
    const baseKey = this.vectorIdEncoder.encode(article.id);

    // Generate segments using the language model
    const {
      object: { topics },
    } = await generateObject({
      model: this.summaryModel,
      system: SubTopicInstruction,
      prompt: article.content,
      schema: z.object({
        topics: z
          .array(z.string().describe("The sub-topic of article"))
          .max(3)
          .min(1),
      }),
    });

    const topicCount = Math.min(topics.length, MaxTopicVectorCount);

    // Create a vector for each segment
    const vectors: Vector[] = [];
    for (let i = 0; i < topicCount; i++) {
      const topic = topics[i].trim();
      // Create a unique ID for each segment
      const vector = new TopicVector(baseKey, i);

      // Set metadata from article
      this.setVectorMetadata(vector, article);
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: topic,
      });

      vector.update(embedding);
      vectors.push(vector);
    }

    return vectors;
  }
}
