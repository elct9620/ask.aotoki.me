import { DocumentVectorFactory, VectorRepository } from "./interface";

export class RefreshDocumentVector {
  constructor(
    private readonly vectorFactory: DocumentVectorFactory,
    private readonly vectoreRepository: VectorRepository,
  ) {}

  async execute(bucket: string, key: string): Promise<void> {
    const path = `${bucket}/${key}`;

    const fullVector = await this.vectorFactory.createFull(path);
    const summaryVector = await this.vectorFactory.createSummary(path);

    await this.vectoreRepository.upsertAll([fullVector, summaryVector]);
  }
}
