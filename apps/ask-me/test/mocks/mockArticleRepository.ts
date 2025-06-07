import { Article } from "@/entity/Article";
import { injectable } from "tsyringe";

/**
 * Mock implementation of ArticleRepository for testing
 */
@injectable()
export class MockArticleRepository {
  private articles: Map<string, Article> = new Map();

  /**
   * Add a mock article to the repository
   * 
   * @param id The article ID
   * @param article The article to add
   */
  addMockArticle(id: string, article: Article): void {
    this.articles.set(id, article);
  }

  /**
   * Find an article by ID
   * 
   * @param id The article ID to find
   * @returns The found article or null
   */
  async findById(id: string): Promise<Article | null> {
    return this.articles.get(id) || null;
  }

  /**
   * Find multiple articles by their IDs
   * 
   * @param ids Array of article IDs to find
   * @returns Array of found articles (excluding not found)
   */
  async findByIds(ids: string[]): Promise<Article[]> {
    return ids
      .map((id) => this.articles.get(id))
      .filter((article): article is Article => article !== null);
  }

  /**
   * Reset the mock repository state
   */
  reset(): void {
    this.articles.clear();
  }
}
