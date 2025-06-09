import { Article } from "@/entity/Article";
import { ArticleListPresenter } from "@/usecase/interface";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { injectable } from "tsyringe";

/**
 * Presenter that formats articles in MCP format
 */
@injectable()
export class McpArticleListPresenter implements ArticleListPresenter {
  private articles: Article[] = [];
  private isError = false;
  private errorMessage = "";

  addArticle(article: Article): void {
    this.articles.push(article);
  }

  setError(message: string): void {
    this.isError = true;
    this.errorMessage = message;
  }

  toMCP(): CallToolResult {
    if (this.isError) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `An error occurred: ${this.errorMessage}`,
          },
        ],
      };
    }

    if (this.articles.length === 0) {
      return {
        isError: false,
        content: [
          { type: "text", text: "No articles found for the given query." },
        ],
      };
    }

    return {
      isError: false,
      content: this.articles.map((article) => ({
        type: "text",
        text: JSON.stringify({
          title: article.title,
          content: article.content,
          permalink: article.permalink,
          series: article.series,
          tags: article.tags,
          publishedAt: article.publishedAt,
        }),
      })),
    };
  }

  clear(): void {
    this.articles = [];
    this.isError = false;
    this.errorMessage = "";
  }
}
