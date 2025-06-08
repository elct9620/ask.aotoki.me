import { IChatModel } from "@/service/llm";
import {
  ArticleRepository,
  IArticleRepository,
  IVectorRepository,
  VectorRepository,
} from "@/usecase/interface";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  LanguageModel,
  streamText,
  StreamTextOnFinishCallback,
  tool,
  ToolSet,
} from "ai";
import { container } from "tsyringe";
import { z } from "zod";
import { QueryArticle } from "./usecase/queryArticle";

async function queryToolHandler({ query }: { query: string }) {
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

export class AskMeAgent extends AIChatAgent {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const model = container.resolve<LanguageModel>(IChatModel);

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const stream = streamText({
          model,
          tools: {
            query: tool({
              description: "Query the article is written by Aotokitsuruya",
              parameters: z.object({
                query: z.string().min(1, "the question to search"),
              }),
              execute: queryToolHandler,
            }),
          },
          maxSteps: 10,
          messages: this.messages,
          onFinish,
        });

        stream.mergeIntoDataStream(dataStream);
      },
    });
  }
}
