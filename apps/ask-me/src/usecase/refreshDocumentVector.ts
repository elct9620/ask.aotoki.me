import { DocumentVector } from "@/entity/DocumentVector";
import {
  ArticleRepository,
  DocumentVectorFactory,
  VectorRepository,
} from "./interface";

export class RefreshDocumentVector {
  constructor(
    private readonly vectorFactory: DocumentVectorFactory,
    private readonly vectoreRepository: VectorRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(key: string): Promise<void> {
    const article = await this.articleRepository.findById(key);
    if (!article) {
      throw new Error(`Article with id ${key} not found`);
    }

    const fullVector = await this.vectorFactory.createFull(article);
    const summaryVector = await this.vectorFactory.createSummary(article);

    let vectors: DocumentVector[] = [];
    if (fullVector) {
      vectors.push(fullVector);
    }
    if (summaryVector) {
      vectors.push(summaryVector);
    }

    await this.vectoreRepository.upsertAll(vectors);
  }
}
