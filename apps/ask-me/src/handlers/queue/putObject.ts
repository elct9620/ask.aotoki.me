import {
  ArticleRepository,
  DocumentVectorFactory,
  IArticleRepository,
  IDocumentVectorFactory,
  IVectorRepository,
  VectorRepository,
} from "@/usecase/interface";
import { RefreshVector } from "@/usecase/refreshVector";
import { QueueMessage } from "@ask-me/queue-router";
import { container } from "tsyringe";

export async function handlePutObject(
  message: QueueMessage<R2Event>,
  params: Record<string, string>,
  env: Env,
  ctx: ExecutionContext,
) {
  try {
    const vectorFactory = container.resolve<DocumentVectorFactory>(
      IDocumentVectorFactory,
    );
    const vectoreRepository =
      container.resolve<VectorRepository>(IVectorRepository);
    const articleRepository =
      container.resolve<ArticleRepository>(IArticleRepository);

    const usecase = new RefreshVector(
      vectorFactory,
      vectoreRepository,
      articleRepository,
    );

    console.log("Handling putObject for key:", message.body.object.key);
    await usecase.execute(message.body.object.key);
    message.ack();
  } catch (error) {
    console.error("Error handling putObject:", error);
    message.retry({
      delaySeconds: (message.attempts + 1) * 10,
    });
  }
}
