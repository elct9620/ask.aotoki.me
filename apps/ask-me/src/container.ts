import { env } from "cloudflare:workers";
import { container } from "tsyringe";

import {
  CloudflareVectorRepository,
  VECTORIZE,
} from "@/repository/cloudflareVectorRepository";
import { LlmDocumentVectorFactory } from "@/service/llmDocumentVectorFactory";
import { Md5VectorIdEncoder } from "@/service/md5VectorIdEncoder";
import {
  DocumentVectorFactory,
  IDocumentVectorFactory,
  IVectorIdEncoder,
  IVectorRepository,
  VectorIdEncoder,
  VectorRepository,
} from "@/usecase/interface";

container.register(VECTORIZE, { useValue: env.VECTORIZE });

// Register repositories
container.register<VectorRepository>(IVectorRepository, {
  useClass: CloudflareVectorRepository,
});

// Register services
container.register<VectorIdEncoder>(IVectorIdEncoder, {
  useClass: Md5VectorIdEncoder,
});
container.register<DocumentVectorFactory>(IDocumentVectorFactory, {
  useClass: LlmDocumentVectorFactory,
});
