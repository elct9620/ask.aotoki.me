import { ArticleRepository, VectorRepository } from "./interface";

export class QueryArticle {
  constructor(
    private readonly vectorRepository: VectorRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(query: string) {
    const vectors = await this.vectorRepository.query(query, 5);
    if (vectors.length === 0) {
      return [];
    }

    const articleIds = vectors
      .map((vector) => vector.objectKey)
      .filter((id) => id !== null);
    if (articleIds.length === 0) {
      return [];
    }

    const uniqueArticleIds = Array.from(new Set(articleIds));
    const articles = await this.articleRepository.findByIds(uniqueArticleIds);
    if (articles.length === 0) {
      return [];
    }

    return articles.map((article) => ({
      title: article.title,
      content: article.content,
      permalink: article.permalink,
      series: article.series,
      tags: article.tags,
      publishedAt: article.publishedAt,
    }));
  }
}
