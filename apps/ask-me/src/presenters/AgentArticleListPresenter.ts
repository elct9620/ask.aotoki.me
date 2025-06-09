import { Article } from "@/entity/Article";
import { ArticleListPresenter } from "@/usecase/interface";
import { injectable } from "tsyringe";

/**
 * Presenter that formats articles in Agent format
 */
@injectable()
export class AgentArticleListPresenter implements ArticleListPresenter {
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

  toAgent() {
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
        text: JSON.stringify(article),
      })),
    };
  }

  clear(): void {
    this.articles = [];
    this.isError = false;
    this.errorMessage = "";
  }
}
