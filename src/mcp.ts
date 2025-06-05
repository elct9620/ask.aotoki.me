import { McpAgent } from 'agents/mcp'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { version } from '../package.json'

export class AskMCP extends McpAgent {
  server: McpServer = new McpServer({
    name: 'Ask Aotokitsuruya',
    version,
  })

  async init() {
  }
}
