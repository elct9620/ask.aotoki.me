import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
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
import { LanguageModel } from "ai";
import { IEmbeddingModel, ISummaryModel } from "./service/llm";

const IOpenAIProvider = Symbol("IOpenAIProvider");

container.register(VECTORIZE, { useValue: env.VECTORIZE });
container.register(BUCKET, { useValue: env.BUCKET });

container.register<OpenAIProvider>(IOpenAIProvider, {
  useFactory: () => {
    return createOpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
    });
  },
});
container.register(IEmbeddingModel, {
  useFactory: (c) => {
    const provider = c.resolve<OpenAIProvider>(IOpenAIProvider);
    return provider.embedding("text-embedding-3-small");
  },
});
container.register<LanguageModel>(ISummaryModel, {
  useFactory: (c) => {
    const provider = c.resolve<OpenAIProvider>(IOpenAIProvider);
    return provider("gpt-4.1-mini");
  },
});

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
