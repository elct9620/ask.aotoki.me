import { DocumentVectorFactory, VectorRepository } from "./interface";

export class RefreshDocumentVector {
  constructor(
    private readonly vectorFactory: DocumentVectorFactory,
    private readonly vectoreRepository: VectorRepository,
  ) {}

  async execute(key: string): Promise<void> {
    const fullVector = await this.vectorFactory.createFull(key);
    const summaryVector = await this.vectorFactory.createSummary(key);

    await this.vectoreRepository.upsertAll([fullVector, summaryVector]);
  }
}
