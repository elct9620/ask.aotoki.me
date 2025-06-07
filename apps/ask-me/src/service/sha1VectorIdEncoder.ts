import { VectorIdEncoder } from "@/usecase/interface";
import { createHash } from "crypto";
import { injectable } from "tsyringe";

/**
 * Implementation of VectorIdEncoder that uses SHA1 hash
 */
@injectable()
export class Sha1VectorIdEncoder implements VectorIdEncoder {
  /**
   * Encodes a vector ID using SHA1 hash
   *
   * @param id - The original ID to encode
   * @returns SHA1 hash of the ID
   */
  encode(id: string): string {
    return createHash("sha1").update(id).digest("hex");
  }
}
