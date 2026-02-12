import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { version } from "../package.json";
import { AskTool, askToolHandler } from "./handlers/mcp/ask";

const CLEANUP_DELAY_MS = 3600 * 1000;

export class AskMCP extends McpAgent {
  server: McpServer = new McpServer({
    name: "Ask Aotokitsuruya",
    version,
  });

  async init() {
    this.server.tool(
      AskTool.name,
      AskTool.description,
      AskTool.inputSchema,
      askToolHandler,
    );
  }

  async fetch(request: Request): Promise<Response> {
    const response = await super.fetch(request);
    await this.ctx.storage.setAlarm(Date.now() + CLEANUP_DELAY_MS);
    return response;
  }

  async alarm() {
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.deleteAlarm();
  }
}
