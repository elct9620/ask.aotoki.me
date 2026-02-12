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
import { Connection } from "agents";
import { container } from "tsyringe";
import { ChatInstruction } from "./entity/Instruction";
import { QueryTool, queryToolHandler } from "./handlers/agent/query";

const CLEANUP_DELAY_SECONDS = 3600;

export class AskMeAgent extends AIChatAgent {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    await this.scheduleCleanup();

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

  async onClose(connection: Connection, _code: number, _reason: string) {
    const connections = [...this.getConnections()];
    const remaining = connections.filter((c) => c.id !== connection.id);

    if (remaining.length === 0) {
      await this.scheduleCleanup();
    }
  }

  async cleanup() {
    const connections = [...this.getConnections()];
    if (connections.length > 0) return;

    await this.destroy();
  }

  private async scheduleCleanup() {
    const schedules = this.getSchedules();
    for (const schedule of schedules) {
      await this.cancelSchedule(schedule.id);
    }

    await this.schedule(CLEANUP_DELAY_SECONDS, "cleanup");
  }
}
