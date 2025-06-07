import { container } from "tsyringe";

import { ClearObjectVector } from "@/usecase/clearObjectVector";
import { IVectorRepository, VectorRepository } from "@/usecase/interface";
import { QueueMessage } from "@ask-me/queue-router";

export async function handleDeleteObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: CloudflareBindings,
  ctx: ExecutionContext,
) {
  const vectorRepository =
    container.resolve<VectorRepository>(IVectorRepository);
  const usecase = new ClearObjectVector(vectorRepository);

  try {
    await usecase.execute(message.body.object.key);
    message.ack();
  } catch (error) {
    console.error("Error processing DeleteObject:", error);
    message.retry();
  }
}
