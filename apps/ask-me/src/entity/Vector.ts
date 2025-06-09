export enum VectorType {
  FULL = "full",
  SUMMARY = "summary",
  TOPIC = "topic",
}

export const VectorDimensions = 1536; // OpenAI's text-embedding-small model outputs 1536-dimensional vectors
export const MaxTopicVectorCount = 3; // Maximum number of topic vectors per article

export class Vector {
  private _vector: number[] = [];
  private _metadata: Record<string, any> = {};

  constructor(
    public readonly key: string,
    public readonly type: VectorType,
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

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  setMetadata(key: string, value: any) {
    this._metadata[key] = value;
  }

  get objectKey(): string | null {
    return this._metadata["objectKey"];
  }
}

export class TopicVector extends Vector {
  constructor(
    key: string,
    public readonly index: number,
  ) {
    super(key, VectorType.TOPIC);
  }

  get id() {
    return `${this.key}#${this.type}-${this.index}`;
  }
}
