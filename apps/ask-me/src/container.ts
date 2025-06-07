import { container } from "tsyringe";
import {
  CloudflareVectorRepository,
  VECTORIZE,
} from "./repository/cloudflareVectorRepository";
import { IVectorRepository } from "./usecase/interface";

export function setupContainer(env: Env): void {
  // Register Cloudflare bindings
  container.register(VECTORIZE, { useValue: env.VECTORIZE });

  // Register repositories
  container.register<VectorRepository>(IVectorRepository, {
    useClass: CloudflareVectorRepository,
  });
}
