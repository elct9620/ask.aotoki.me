import { Article } from "@/entity/Article";
import { DocumentVector, DocumentVectorType } from "@/entity/DocumentVector";
import {
  DocumentVectorFactory,
  IVectorIdEncoder,
  type VectorIdEncoder,
} from "@/usecase/interface";
import {
  embed,
  generateText,
  type EmbeddingModel,
  type LanguageModel,
} from "ai";
import { inject, injectable } from "tsyringe";
import { IEmbeddingModel, ISummaryModel } from "./llm";

/**
 * Implementation of DocumentVectorFactory that will use LLMs to generate vectors
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
   * Create a full document vector containing detailed content
   *
   * @param article Article object containing the content
   * @returns A DocumentVector with full content
   */
  async createFull(article: Article): Promise<DocumentVector> {
    const encodedKey = this.vectorIdEncoder.encode(article.id);
    // This is a placeholder implementation
    // In the future, this would call an LLM to generate vectors
    const vector = new DocumentVector(encodedKey, DocumentVectorType.FULL);

    // Set metadata from article
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

    const { embedding } = await embed({
      model: this.embeddingModel,
      value: article.content,
    });

    vector.update(embedding);

    return vector;
  }

  /**
   * Create a summary document vector containing condensed content
   *
   * @param article Article object containing the content
   * @returns A DocumentVector with summary content
   */
  async createSummary(article: Article): Promise<DocumentVector> {
    const encodedKey = this.vectorIdEncoder.encode(article.id);
    // This is a placeholder implementation
    // In the future, this would call an LLM to generate vectors
    const vector = new DocumentVector(encodedKey, DocumentVectorType.SUMMARY);

    // Set metadata from article
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

    const { text: summary } = await generateText({
      model: this.summaryModel,
      system: "You are a helpful assistant that summarizes articles.",
      prompt: article.content,
    });

    const { embedding } = await embed({
      model: this.embeddingModel,
      value: summary,
    });

    vector.update(embedding);

    return vector;
  }
}
