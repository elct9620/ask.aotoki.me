import { VectorRepository } from "./interface";

export class ClearObjectVector {
  constructor(private readonly vectorRepository: VectorRepository) {}

  async execute(key: string): Promise<void> {
    const ids = [`${key}#full`, `${key}#summary`];

    await this.vectorRepository.deleteAll(ids);
  }
}
