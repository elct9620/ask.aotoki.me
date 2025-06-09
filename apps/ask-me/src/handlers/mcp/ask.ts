import { McpArticleListPresenter } from "@/presenters/McpArticleListPresenter";
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
  const presenter = new McpArticleListPresenter();

  try {
    const vectorRepository =
      container.resolve<VectorRepository>(IVectorRepository);
    const articleRepository =
      container.resolve<ArticleRepository>(IArticleRepository);
    const usecase = new QueryArticle(
      vectorRepository,
      articleRepository,
      presenter,
    );
    await usecase.execute(query);

    return presenter.toMCP();
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
