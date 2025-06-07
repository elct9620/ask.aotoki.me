import { QueueMessage } from "@ask-me/queue-router";

export async function handlePutObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: CloudflareBindings,
  ctx: ExecutionContext,
) {
  console.log("Accepted PutObject", params, message.id, message.body);

  message.ack();
}
