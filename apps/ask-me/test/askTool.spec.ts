import { expect, describe, it, vi, beforeEach } from "vitest";
import { askToolHandler } from "@/handlers/tools/ask";
import { container } from "tsyringe";
import { IArticleRepository, IVectorRepository } from "@/usecase/interface";
import { MockVectorRepository } from "./mocks/mockVectorRepository";
import { Article, ArticleLanguage } from "@/entity/Article";
import { DocumentVector } from "@/entity/DocumentVector";

// Mock Article Repository for testing
class MockArticleRepository {
  private articles: Map<string, Article> = new Map();

  addMockArticle(id: string, article: Article): void {
    this.articles.set(id, article);
  }

  async findById(id: string): Promise<Article | null> {
    return this.articles.get(id) || null;
  }

  async findByIds(ids: string[]): Promise<Article[]> {
    return ids
      .map(id => this.articles.get(id))
      .filter((article): article is Article => article !== null);
  }
}

describe("AskTool Handler", () => {
  let mockVectorRepository: MockVectorRepository;
  let mockArticleRepository: MockArticleRepository;

  beforeEach(() => {
    // Reset container and register mocks
    container.clearInstances();
    
    mockVectorRepository = new MockVectorRepository();
    mockArticleRepository = new MockArticleRepository();
    
    container.register(IVectorRepository, { useValue: mockVectorRepository });
    container.register(IArticleRepository, { useValue: mockArticleRepository });

    // Reset mock state
    mockVectorRepository.reset();
  });

  it("should return empty result when no articles are found", async () => {
    // Setup empty results from vector repository
    mockVectorRepository.queryResults = [];

    const result = await askToolHandler({ query: "test query" });

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("No articles found");
  });

  it("should return articles matching the query", async () => {
    // Create a test article
    const testArticle = new Article(
      "article1",
      "Test Article Title",
      "This is test content for the article.",
      ArticleLanguage.English
    );
    testArticle.publish("https://example.com/article1", Date.now());
    
    // Add the article to our mock repository
    mockArticleRepository.addMockArticle("article1", testArticle);
    
    // Setup vector repository to return a document vector pointing to our article
    const vector = new DocumentVector("vector1", DocumentVector.Type.FULL);
    vector.setMetadata("objectKey", "article1");
    mockVectorRepository.queryResults = [vector];

    // Execute the handler
    const result = await askToolHandler({ query: "test query" });

    // Verify the result
    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    
    // Check that the returned article was serialized correctly
    const content = JSON.parse(result.content[0].text);
    expect(content.title).toBe("Test Article Title");
    expect(content.permalink).toBe("https://example.com/article1");
  });

  it("should handle errors gracefully", async () => {
    // Setup mock to throw an error
    vi.spyOn(mockVectorRepository, 'query').mockImplementation(() => {
      throw new Error("Test error");
    });

    const result = await askToolHandler({ query: "test query" });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toContain("Test error");
  });
});
