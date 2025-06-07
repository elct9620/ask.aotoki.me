import { ClearObjectVector } from "@/usecase/clearObjectVector";
import { QueueMessage } from "@ask-me/queue-router";

export async function handleDeleteObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: CloudflareBindings,
  ctx: ExecutionContext,
) {
  const usecase = new ClearObjectVector();

  try {
    await usecase.execute(message.body.bucket, message.body.object.key);
    message.ack();
  } catch (error) {
    console.error("Error processing DeleteObject:", error);
    message.retry();
  }
}
