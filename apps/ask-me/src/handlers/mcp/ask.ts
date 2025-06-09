import {
  ArticleRepository,
  IArticleRepository,
  IVectorRepository,
  VectorRepository,
} from "@/usecase/interface";
import { QueryArticle } from "@/usecase/queryArticle";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { container } from "tsyringe";
import { z } from "zod";

export const AskTool = {
  name: "ask",
  description: "Query the article is written by Aotokitsuruya",
  inputSchema: { query: z.string().min(1, "Query is required") },
};

export async function askToolHandler(input: {
  query: string;
}): Promise<CallToolResult> {
  const { query } = input;

  try {
    const vectorRepository =
      container.resolve<VectorRepository>(IVectorRepository);
    const articleRepository =
      container.resolve<ArticleRepository>(IArticleRepository);
    const usecase = new QueryArticle(vectorRepository, articleRepository);
    const articles = await usecase.execute(query);

    if (articles.length === 0) {
      return {
        isError: false,
        content: [
          { type: "text", text: "No articles found for the given query." },
        ],
      };
    }

    return {
      isError: false,
      content: articles.map((article) => ({
        type: "text",
        text: JSON.stringify(article),
      })),
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `An error occurred while processing the query: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
