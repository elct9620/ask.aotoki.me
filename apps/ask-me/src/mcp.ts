import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { version } from "../package.json";

export class AskMCP extends McpAgent {
  server: McpServer = new McpServer({
    name: "Ask Aotokitsuruya",
    version,
  });

  async init() {
    this.server.tool(
      "ask",
      "Query the article is written by Aotokitsuruya",
      { query: z.string() },
      async (input) => {
        return {
          isError: false,
          content: [],
        };
      },
    );
  }
}
