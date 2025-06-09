import { Vector } from "@/entity/Vector";
import {
  ArticleRepository,
  DocumentVectorFactory,
  VectorRepository,
} from "./interface";

export class RefreshVector {
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
    const topicsVector = await this.vectorFactory.createTopics(article);

    let vectors: Vector[] = [summaryVector, ...topicsVector];

    // If the full vector is created successfully, add it to the list
    if (fullVector) {
      vectors.push(fullVector);
    }

    await this.vectoreRepository.upsertAll(vectors);
  }
}
