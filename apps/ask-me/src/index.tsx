import "@abraham/reflection";

import { QueueRouter } from "@ask-me/queue-router";
import { Hono } from "hono";

import "@/container";
import { handleDeleteObject } from "@/handlers/queue/deleteObject";
import { handlePutObject } from "@/handlers/queue/putObject";
import { AskMCP } from "@/mcp";
import { renderer } from "@/renderer";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.text(`Working in progress...`);
});

app.mount("/sse", AskMCP.serveSSE("/sse").fetch, { replaceRequest: false });
app.mount("/mcp", AskMCP.serve("/mcp").fetch, { replaceRequest: false });

const queue = new QueueRouter<Env>();

queue.on("PutObject", "/content/:path*", handlePutObject);
queue.on("DeleteObject", "/content/:path*", handleDeleteObject);

export { AskMCP } from "./mcp";
export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch, env: Env, ctx: ExecutionContext) {
    await queue.processBatch(batch, env, ctx);
  },
} satisfies ExportedHandler<Env>;
