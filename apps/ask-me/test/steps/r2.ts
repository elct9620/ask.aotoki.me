import { BUCKET } from "@/repository/r2ArticleRepository";
import { container } from "tsyringe";

/**
 * Add an object with content to the R2 bucket for testing
 *
 * @param key The object key to store in R2
 * @param content The object content to serialize and store
 * @returns Promise that resolves when the object is stored
 */
export async function givenObjectWithContent(
  key: string,
  content: Record<string, any>,
): Promise<void> {
  const bucket = container.resolve<R2Bucket>(BUCKET);
  await bucket.put(key, JSON.stringify(content));
}
