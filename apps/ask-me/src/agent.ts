import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  LanguageModel,
  streamText,
  StreamTextOnFinishCallback,
  ToolSet,
} from "ai";
import { container } from "tsyringe";
import { ISummaryModel } from "./service/llm";

export class AskMeAgent extends AIChatAgent {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const model = container.resolve<LanguageModel>(ISummaryModel);

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const stream = streamText({
          model,
          messages: this.messages,
          onFinish,
        });

        stream.mergeIntoDataStream(dataStream);
      },
    });
  }
}
