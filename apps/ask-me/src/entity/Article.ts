export enum ArticleLanguage {
  Taiwanese = "zh-TW",
  English = "en-US",
}

export class Article {
  private _series: string | null = null;
  private _tags: string[] = [];
  private _publishedAt: number | null = null;
  private _permalink: string | null = null;

  constructor(
    public readonly objectKey: string,
    public readonly title: string,
    public readonly content: string,
    public readonly language: ArticleLanguage = ArticleLanguage.Taiwanese,
  ) {}

  get id(): string {
    return this.objectKey;
  }

  get series(): string | null {
    return this._series;
  }

  setSeries(series: string): void {
    this._series = series;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  addTag(tag: string): void {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
    }
  }

  get publishedAt(): number | null {
    return this._publishedAt;
  }

  get permalink(): string | null {
    return this._permalink;
  }

  publish(permalink: string, timestamp: number): void {
    this._permalink = permalink;
    this._publishedAt = timestamp;
  }
}
