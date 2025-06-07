import { env } from "cloudflare:workers";
import { container } from "tsyringe";

import {
  CloudflareVectorRepository,
  VECTORIZE,
} from "@/repository/cloudflareVectorRepository";
import { BUCKET, R2ArticleRepository } from "@/repository/r2ArticleRepository";
import { LlmDocumentVectorFactory } from "@/service/llmDocumentVectorFactory";
import { Md5VectorIdEncoder } from "@/service/md5VectorIdEncoder";
import {
  ArticleRepository,
  DocumentVectorFactory,
  IArticleRepository,
  IDocumentVectorFactory,
  IVectorIdEncoder,
  IVectorRepository,
  VectorIdEncoder,
  VectorRepository,
} from "@/usecase/interface";

container.register(VECTORIZE, { useValue: env.VECTORIZE });
container.register(BUCKET, { useValue: env.ARTICLES });

// Register repositories
container.register<VectorRepository>(IVectorRepository, {
  useClass: CloudflareVectorRepository,
});
container.register<ArticleRepository>(IArticleRepository, {
  useClass: R2ArticleRepository,
});

// Register services
container.register<VectorIdEncoder>(IVectorIdEncoder, {
  useClass: Md5VectorIdEncoder,
});
container.register<DocumentVectorFactory>(IDocumentVectorFactory, {
  useClass: LlmDocumentVectorFactory,
});
