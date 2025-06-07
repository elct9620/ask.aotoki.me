import {
  DocumentVector,
  DocumentVectorType,
  VectorDimensions,
} from "@/entity/DocumentVector";
import { DocumentVectorFactory } from "@/usecase/interface";
import { injectable } from "tsyringe";

/**
 * Implementation of DocumentVectorFactory that will use LLMs to generate vectors
 * Currently returns mock objects for future implementation
 */
@injectable()
export class LlmDocumentVectorFactory implements DocumentVectorFactory {
  /**
   * Create a full document vector containing detailed content
   *
   * @param path Path to the document
   * @returns A DocumentVector with full content
   */
  async createFull(path: string): Promise<DocumentVector> {
    // This is a placeholder implementation
    // In the future, this would call an LLM to generate vectors
    const vector = new DocumentVector(path, DocumentVectorType.FULL);

    // Add mock vector data (all zeros for now)
    const mockVector = new Array(VectorDimensions).fill(0);
    vector.updateVector(mockVector);

    return vector;
  }

  /**
   * Create a summary document vector containing condensed content
   *
   * @param path Path to the document
   * @returns A DocumentVector with summary content
   */
  async createSummary(path: string): Promise<DocumentVector> {
    // This is a placeholder implementation
    // In the future, this would call an LLM to generate vectors
    const vector = new DocumentVector(path, DocumentVectorType.SUMMARY);

    // Add mock vector data (all zeros for now)
    const mockVector = new Array(VectorDimensions).fill(0);
    vector.updateVector(mockVector);

    return vector;
  }
}
