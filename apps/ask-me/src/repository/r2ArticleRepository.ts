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

  async findById(id: string): Promise<Article | null> {
    try {
      // Get the object from R2
      const object = await this.bucket.get(id);

      if (!object) {
        return null;
      }

      // Parse the JSON content
      const articleData = await object.json<R2ArticleObject>();

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
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      return null;
    }
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
