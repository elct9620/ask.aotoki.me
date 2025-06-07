import {
  ArticleRepository,
  IArticleRepository,
  IVectorRepository,
  VectorRepository,
} from "@/usecase/interface";
import { QueryArticle } from "@/usecase/queryArticle";
import { container } from "tsyringe";
import { z } from "zod";

export const AskTool = {
  name: "ask",
  description: "Query the article is written by Aotokitsuruya",
  inputSchema: { query: z.string().min(1, "Query is required") },
};

export async function askToolHandler(input: { query: string }) {
  const { query } = input;

  try {
    const vectorRepository =
      container.resolve<VectorRepository>(IVectorRepository);
    const articleRepository =
      container.resolve<ArticleRepository>(IArticleRepository);
    const usecase = new QueryArticle(vectorRepository, articleRepository);
    const articles = await usecase.execute(query);

    return {
      isError: false,
      content: articles.map((article) => ({
        title: article.title,
        content: article.content,
        permalink: article.permalink,
        series: article.series,
        tags: article.tags,
      })),
    };
  } catch (error) {
    return {
      isError: true,
      content: {
        error: error instanceof Error ? error.message : error,
      },
    };
  }
}
