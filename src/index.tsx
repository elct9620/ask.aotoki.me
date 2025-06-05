import "@abraham/reflection"

import { Hono } from 'hono'
import { renderer } from './renderer'
import { AskMCP } from './mcp'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.text(`Working in progress...`)
})

app.mount('/sse', AskMCP.serveSSE('/sse').fetch,{ replaceRequest: false })
app.mount('/mcp', AskMCP.serve('/mcp').fetch, { replaceRequest: false })

export { AskMCP } from './mcp'
export default {
  fetch: app.fetch,
  async queue(
    batch: MessageBatch,
    env: CloudflareBindings,
    ctx: ExecutionContext
  ) {
    // This is a placeholder for any queue-related logic if needed in the future.
  }
}
