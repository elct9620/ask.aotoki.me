import { AgentArticleListPresenter } from "@/presenters/AgentArticleListPresenter";
import {
  ArticleRepository,
  IArticleRepository,
  IVectorRepository,
  VectorRepository,
} from "@/usecase/interface";
import { QueryArticle } from "@/usecase/queryArticle";
import { container } from "tsyringe";
import { z } from "zod";

export const QueryTool = {
  name: "query",
  description: "Query the article is written by Aotokitsuruya",
  inputSchema: z.object({
    query: z.string().min(1, "the question to search"),
  }),
};

export async function queryToolHandler(input: { query: string }) {
  const presenter = new AgentArticleListPresenter();

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
    await usecase.execute(input.query);

    return presenter.toAgent();
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
