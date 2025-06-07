import { VectorIdEncoder, VectorRepository } from "./interface";

export class ClearDocumentVector {
  constructor(
    private readonly encoder: VectorIdEncoder,
    private readonly vectorRepository: VectorRepository,
  ) {}

  async execute(key: string): Promise<void> {
    const encodedKey = this.encoder.encode(key);
    const ids = [`${encodedKey}#full`, `${encodedKey}#summary`];

    await this.vectorRepository.deleteAll(ids);
  }
}
