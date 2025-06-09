import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { version } from "../package.json";
import { AskTool, askToolHandler } from "./handlers/mcp/ask";

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
}
