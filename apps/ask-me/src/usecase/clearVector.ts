import { VectorType } from "@/entity/Vector";
import { VectorIdEncoder, VectorRepository } from "./interface";

export class ClearVector {
  constructor(
    private readonly encoder: VectorIdEncoder,
    private readonly vectorRepository: VectorRepository,
  ) {}

  async execute(key: string): Promise<void> {
    const encodedKey = this.encoder.encode(key);
    const ids = [
      `${encodedKey}#${VectorType.FULL}`,
      `${encodedKey}#${VectorType.SUMMARY}`,
    ];

    await this.vectorRepository.deleteAll(ids);
  }
}
