import { QueueMessage } from "@ask-me/queue-router";

export async function handlePutObject(
  message: QueueMessage,
  params: Record<string, string>,
  env: CloudflareBindings,
  ctx: ExecutionContext,
) {
  console.log("Accepted PutObject", params, message.id, message.body);

  message.ack();
}
