import { IChatModel } from "@/service/llm";
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
import { ChatInstruction } from "./entity/Instruction";
import { QueryTool, queryToolHandler } from "./handlers/agent/query";

export class AskMeAgent extends AIChatAgent {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const model = container.resolve<LanguageModel>(IChatModel);

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const stream = streamText({
          model,
          tools: {
            [QueryTool.name]: tool({
              description: QueryTool.description,
              parameters: QueryTool.inputSchema,
              execute: queryToolHandler,
            }),
          },
          maxSteps: 10,
          system: ChatInstruction,
          messages: this.messages,
          onFinish,
        });

        stream.mergeIntoDataStream(dataStream);
      },
    });
  }
}
