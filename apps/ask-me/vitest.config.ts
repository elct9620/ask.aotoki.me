import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
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
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
    coverage: {
      provider: "istanbul",
    },
  },
});
