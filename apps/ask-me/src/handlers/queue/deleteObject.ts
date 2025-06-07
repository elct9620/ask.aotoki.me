import { QueueMessage } from "@ask-me/queue-router";

export async function handleDeleteObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: CloudflareBindings,
  ctx: ExecutionContext,
) {
  console.log("Accepted DeleteObject", params, message.id, message.body);

  message.ack();
}
