import { AIChatAgent } from "agents/ai-chat-agent";
import { StreamTextOnFinishCallback, ToolSet } from "ai";

export class AskMeAgent extends AIChatAgent {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    return new Response("開發中⋯⋯");
  }
}
