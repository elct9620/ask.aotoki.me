import { Article } from "@/entity/Article";
import { Vector } from "@/entity/Vector";

export const IVectorRepository = Symbol("IVectorRepository");
export interface VectorRepository {
  query(query: string, topK?: number): Promise<Vector[]>;
  upsertAll(vectors: Vector[]): Promise<void>;
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

export const IDocumentVectorFactory = Symbol("IDocumentVectorFactory");
export interface DocumentVectorFactory {
  createFull(article: Article): Promise<Vector | null>;
  createSummary(article: Article): Promise<Vector>;
}

export const IArticleListPresenter = Symbol("IArticleListPresenter");
export interface ArticleListPresenter {
  addArticle(article: Article): void;
}
