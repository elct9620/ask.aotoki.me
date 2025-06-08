import { cloudflare } from "@cloudflare/vite-plugin";
import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersProject({
  plugins: [cloudflare(), tsconfigPaths()],
  test: {
    alias: [
      // NOTE: Workaround for ajv exports used by MCP cannot be resolved
      {
        find: "ajv",
        replacement: path.resolve(
          __dirname,
          "node_modules/ajv/dist/ajv.min.js",
        ),
      },
    ],
    setupFiles: ["./test/setup.ts"],
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          compatibilityFlags: ["service_binding_extra_handlers"],
          queueConsumers: {
            queue: { maxBatchTimeout: 0.05 /* 50ms */ },
          },
        },
      },
    },
  },
});
