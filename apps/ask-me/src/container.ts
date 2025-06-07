import { env } from "cloudflare:workers";
import "reflect-metadata"; // Required by tsyringe
import { container } from "tsyringe";

import {
  CloudflareVectorRepository,
  VECTORIZE,
} from "@/repository/cloudflareVectorRepository";
import { IVectorRepository, IVectorIdEncoder, VectorRepository, VectorIdEncoder } from "@/usecase/interface";
import { Md5VectorIdEncoder } from "@/service/md5VectorIdEncoder";

container.register(VECTORIZE, { useValue: env.VECTORIZE });

// Register repositories
container.register<VectorRepository>(IVectorRepository, {
  useClass: CloudflareVectorRepository,
});

// Register services
container.register<VectorIdEncoder>(IVectorIdEncoder, {
  useClass: Md5VectorIdEncoder,
});
