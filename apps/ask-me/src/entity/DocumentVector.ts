export enum DocumentVectorType {
  FULL = "full",
  SUMMARY = "summary",
}

export const VectorDimensions = 1536; // OpenAI's text-embedding-small model outputs 1536-dimensional vectors

export class DocumentVector {
  private _vector: number[] = [];

  constructor(
    public readonly key: string,
    public readonly type: DocumentVectorType,
  ) {}

  get id() {
    return `${this.key}#${this.type}`;
  }

  get vector(): number[] {
    return [...this._vector];
  }

  update(vector: number[]) {
    if (vector && vector.length !== VectorDimensions) {
      throw new Error(
        `Vector must have exactly ${VectorDimensions} dimensions.`,
      );
    }

    this._vector = vector;
  }
}
