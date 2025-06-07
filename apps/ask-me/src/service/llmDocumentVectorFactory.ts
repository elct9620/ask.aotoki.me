import { Article } from "@/entity/Article";
import {
  DocumentVector,
  DocumentVectorType,
  VectorDimensions,
} from "@/entity/DocumentVector";
import {
  DocumentVectorFactory,
  IVectorIdEncoder,
  type VectorIdEncoder,
} from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

/**
 * Implementation of DocumentVectorFactory that will use LLMs to generate vectors
 * Currently returns mock objects for future implementation
 */
@injectable()
export class LlmDocumentVectorFactory implements DocumentVectorFactory {
  constructor(
    @inject(IVectorIdEncoder)
    private readonly vectorIdEncoder: VectorIdEncoder,
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

    // Add mock vector data (all zeros for now)
    const mockVector = new Array(VectorDimensions).fill(0);
    vector.updateVector(mockVector);

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

    // Add mock vector data (all zeros for now)
    const mockVector = new Array(VectorDimensions).fill(0);
    vector.updateVector(mockVector);

    return vector;
  }
}
