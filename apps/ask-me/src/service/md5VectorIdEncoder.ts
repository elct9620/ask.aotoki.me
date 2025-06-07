import { injectable } from "tsyringe";
import { VectorIdEncoder } from "@/usecase/interface";
import { createHash } from "crypto";

/**
 * Implementation of VectorIdEncoder that uses MD5 hash
 */
@injectable()
export class Md5VectorIdEncoder implements VectorIdEncoder {
  /**
   * Encodes a vector ID using MD5 hash
   * 
   * @param id - The original ID to encode
   * @returns MD5 hash of the ID
   */
  encode(id: string): string {
    return createHash("md5").update(id).digest("hex");
  }
}
