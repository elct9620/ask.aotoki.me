import { DocumentVectorType } from "@/entity/DocumentVector";
import { VectorIdEncoder, VectorRepository } from "./interface";

export class ClearDocumentVector {
  constructor(
    private readonly encoder: VectorIdEncoder,
    private readonly vectorRepository: VectorRepository,
  ) {}

  async execute(key: string): Promise<void> {
    const encodedKey = this.encoder.encode(key);
    const ids = [
      `${encodedKey}#${DocumentVectorType.FULL}`,
      `${encodedKey}#${DocumentVectorType.SUMMARY}`,
    ];

    await this.vectorRepository.deleteAll(ids);
  }
}
