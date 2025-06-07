import { Article, ArticleLanguage } from "@/entity/Article";
import { ArticleRepository } from "@/usecase/interface";
import { inject, injectable } from "tsyringe";

export const BUCKET = Symbol("BUCKET");

interface R2ArticleObject {
  id: string;
  path: string;
  slug: string;
  title: string;
  tags: string[];
  series: string | null;
  published_at: string;
  permalink: string;
  language: string;
  content: string;
}

@injectable()
export class R2ArticleRepository implements ArticleRepository {
  constructor(@inject(BUCKET) private readonly bucket: R2Bucket) {}

  /**
   * Maps R2ArticleObject data to an Article entity
   * 
   * @param id The object key / ID
   * @param articleData The data from R2
   * @returns A populated Article entity
   */
  private mapToArticle(id: string, articleData: R2ArticleObject): Article {
    // Map the R2 data to our Article entity
    const language = this.mapLanguage(articleData.language);
    const article = new Article(
      id, // Using objectKey as the id
      articleData.title,
      articleData.content,
      language,
    );

    // Set additional properties
    if (articleData.series) {
      article.setSeries(articleData.series);
    }

    // Add tags
    if (articleData.tags && Array.isArray(articleData.tags)) {
      for (const tag of articleData.tags) {
        article.addTag(tag);
      }
    }

    // Set publication details if available
    if (articleData.permalink && articleData.published_at) {
      const timestamp = new Date(articleData.published_at).getTime();
      article.publish(articleData.permalink, timestamp);
    }
    
    return article;
  }

  async findById(id: string): Promise<Article | null> {
    try {
      // Get the object from R2
      const object = await this.bucket.get(id);

      if (!object) {
        return null;
      }

      // Parse the JSON content
      const articleData = await object.json<R2ArticleObject>();
      
      return this.mapToArticle(id, articleData);
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      return null;
    }
  }

  async findByIds(ids: string[]): Promise<Article[]> {
    // Filter out empty IDs
    const validIds = ids.filter(id => id.trim().length > 0);
    
    if (validIds.length === 0) {
      return [];
    }
    
    // Create an array of promises for fetching each article
    const articlePromises = validIds.map(async (id) => {
      return this.findById(id);
    });
    
    // Wait for all promises to resolve
    const articles = await Promise.all(articlePromises);
    
    // Filter out any null results
    return articles.filter((article): article is Article => article !== null);
  }

  private mapLanguage(languageCode: string): ArticleLanguage {
    switch (languageCode.toLowerCase()) {
      case "en":
      case "en-us":
        return ArticleLanguage.English;
      case "zh":
      case "zh-tw":
      default:
        return ArticleLanguage.Taiwanese;
    }
  }
}
