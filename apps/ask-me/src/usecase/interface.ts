import { DocumentVector } from "@/entity/DocumentVector";

export const IVectorRepository = Symbol("IVectorRepository");
export interface VectorRepository {
  deleteAll(ids: string[]): Promise<void>;
}

export const IVectorIdEncoder = Symbol("IVectorIdEncoder");
export interface VectorIdEncoder {
  encode(id: string): string;
}

export const IDocumentVectorFactory = Symbol("IFullDocumentVectorFactory");
export interface DocumentVectorFactory {
  createFull(path: string): Promise<DocumentVector>;
  createSummary(path: string): Promise<DocumentVector>;
}
