import { Article } from "@/entity/Article";
import { DocumentVector } from "@/entity/DocumentVector";

export const IVectorRepository = Symbol("IVectorRepository");
export interface VectorRepository {
  query(query: string, topK?: number): Promise<DocumentVector[]>;
  upsertAll(vectors: DocumentVector[]): Promise<void>;
  deleteAll(ids: string[]): Promise<void>;
}

export const IArticleRepository = Symbol("IArticleRepository");
export interface ArticleRepository {
  findById(id: string): Promise<Article | null>;
  findByIds(ids: string[]): Promise<Article[]>;
}

export const IVectorIdEncoder = Symbol("IVectorIdEncoder");
export interface VectorIdEncoder {
  encode(id: string): string;
}

export const IDocumentVectorFactory = Symbol("IFullDocumentVectorFactory");
export interface DocumentVectorFactory {
  createFull(article: Article): Promise<DocumentVector>;
  createSummary(article: Article): Promise<DocumentVector>;
}
