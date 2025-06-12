import {
  ArticleListPresenter,
  ArticleRepository,
  VectorRepository,
} from "./interface";

export class QueryArticle {
  constructor(
    private readonly vectorRepository: VectorRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly articleListPresenter: ArticleListPresenter,
  ) {}

  async execute(query: string) {
    const vectors = await this.vectorRepository.query(query, 5);
    if (vectors.length === 0) {
      return [];
    }

    const articleIds = vectors
      .map((vector) => vector.objectKey)
      .filter((id) => id !== null) as string[];
    if (articleIds.length === 0) {
      return [];
    }

    const articles = await this.articleRepository.findByIds(articleIds);
    if (articles.length === 0) {
      return [];
    }

    articles.forEach((article) => {
      this.articleListPresenter.addArticle(article);
    });
  }
}
