import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Workaround for ajv's issue with vitest
    alias: [
      {
        find: "ajv",
        replacement: path.resolve(
          __dirname,
          "apps/ask-me/node_modules/ajv/dist/ajv.min.js",
        ),
      },
    ],
    workspace: [
      // matches every folder and file inside the `packages` folder
      "packages/*",
      "apps/*",
    ],
    coverage: {
      provider: "istanbul",
      exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
    },
  },
});
