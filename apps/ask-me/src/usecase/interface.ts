export const IVectorRepository = Symbol("IVectorRepository");
export interface VectorRepository {
  deleteAll(ids: string[]): Promise<void>;
}
