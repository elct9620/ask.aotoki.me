import { MaxTopicVectorCount, VectorType } from "@/entity/Vector";
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

    for (let i = 0; i < MaxTopicVectorCount; i++) {
      ids.push(`${encodedKey}#${VectorType.TOPIC}#${i}`);
    }

    await this.vectorRepository.deleteAll(ids);
  }
}
