import { RefreshDocumentVector } from "@/usecase/refreshDocumentVector";
import { QueueMessage } from "@ask-me/queue-router";

export async function handlePutObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: Env,
  ctx: ExecutionContext,
) {
  const usecase = new RefreshDocumentVector();

  try {
    await usecase.execute(message.body.bucket, message.body.object.key);
    message.ack();
  } catch (error) {
    console.error("Error handling putObject:", error);
    message.retry();
  }
}
