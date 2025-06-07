import { env } from "cloudflare:workers";
import { container } from "tsyringe";

import {
  CloudflareVectorRepository,
  VECTORIZE,
} from "@/repository/cloudflareVectorRepository";
import { IVectorRepository, VectorRepository } from "@/usecase/interface";

container.register(VECTORIZE, { useValue: env.VECTORIZE });

// Register repositories
container.register<VectorRepository>(IVectorRepository, {
  useClass: CloudflareVectorRepository,
});
