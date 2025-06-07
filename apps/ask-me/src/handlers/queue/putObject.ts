import {
  DocumentVectorFactory,
  IDocumentVectorFactory,
  IVectorRepository,
  VectorRepository,
} from "@/usecase/interface";
import { RefreshDocumentVector } from "@/usecase/refreshDocumentVector";
import { QueueMessage } from "@ask-me/queue-router";
import { container } from "tsyringe";

export async function handlePutObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: Env,
  ctx: ExecutionContext,
) {
  const vectorFactory = container.resolve<DocumentVectorFactory>(
    IDocumentVectorFactory,
  );
  const vectoreRepository =
    container.resolve<VectorRepository>(IVectorRepository);

  const usecase = new RefreshDocumentVector(vectorFactory, vectoreRepository);

  try {
    await usecase.execute(message.body.object.key);
    message.ack();
  } catch (error) {
    console.error("Error handling putObject:", error);
    message.retry();
  }
}
