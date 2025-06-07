export const IVectorRepository = Symbol("IVectorRepository");
export interface VectorRepository {
  deleteAll(ids: string[]): Promise<void>;
}

export const IVectorIdEncoder = Symbol("IVectorIdEncoder");
export interface VectorIdEncoder {
  encode(id: string): string;
}
